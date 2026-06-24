'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, Loader2, AlertCircle, XCircle } from 'lucide-react';
import { decodeSttMessage } from '@/lib/agora-stt';

export type Domain = 'maritime' | 'coaching';
export interface Turn {
  id: number; sourceText: string; translatedText: string;
  latencyMs: number; model: string; hashConfirmed: boolean;
  timestamp: number; isFinal: boolean;
}

interface LiveSessionProps {
  domain: Domain;
  langSrc: string;
  langTgt: string;
  onTurns: (fn: (prev: Turn[]) => Turn[]) => void;
  onMicState: (s: 'idle' | 'listening' | 'translating' | 'error' | 'connecting') => void;
  onPipelineStatus: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
  onSessionReady: () => void;
}

type StepState = 'pending' | 'running' | 'done' | 'error';

type ParsedStreamTurn = {
  sourceText: string;
  translatedText: string;
  timestamp: number;
  isFinal: boolean;
};

function matchesLanguage(actual: string | undefined, expected: string): boolean {
  if (!actual) return false;
  const actualLower = actual.toLowerCase();
  const expectedLower = expected.toLowerCase();
  const expectedBase = expectedLower.split('-')[0];
  const actualBase = actualLower.split('-')[0];
  return actualLower === expectedLower || actualBase === expectedBase;
}

function parseJsonTurn(raw: string, langTgt: string): ParsedStreamTurn | null {
  const msg = JSON.parse(raw);
  const translations = Array.isArray(msg.translations) ? msg.translations : [];
  const translation = translations.find((item: any) => matchesLanguage(item.lang, langTgt)) ?? translations[0];

  const sourceText = String(msg.transcript ?? msg.viText ?? msg.sourceText ?? msg.text ?? msg.content ?? '').trim();
  const translatedText = String(
    Array.isArray(translation?.texts)
      ? translation.texts.join(' ')
      : translation?.text ?? msg.enText ?? msg.translatedText ?? msg.translated_text ?? '',
  ).trim();

  if (!sourceText && !translatedText) return null;

  return {
    sourceText,
    translatedText,
    timestamp: Number(msg.time ?? msg.timestamp ?? Date.now()),
    isFinal: Boolean(msg.isFinal ?? msg.is_final ?? translation?.isFinal ?? translation?.is_final ?? true),
  };
}

function parseProtobufTurn(data: Uint8Array, langTgt: string): ParsedStreamTurn | null {
  const msg = decodeSttMessage(data);
  if (!msg || msg.dataType !== 'translate') return null;

  const translation = msg.translations.find((item) => matchesLanguage(item.lang, langTgt)) ?? msg.translations[0];
  const sourceText = (msg.transcript ?? '').trim();
  const translatedText = translation?.texts.join(' ').trim() ?? '';

  if (!sourceText && !translatedText) return null;

  return {
    sourceText,
    translatedText,
    timestamp: msg.time || Date.now(),
    isFinal: translation?.isFinal ?? msg.words.every((word) => word.isFinal),
  };
}

function parseStreamTurn(data: Uint8Array, langTgt: string): ParsedStreamTurn | null {
  try {
    const raw = new TextDecoder().decode(data);
    if (raw.trim().startsWith('{')) return parseJsonTurn(raw, langTgt);
  } catch {
    // Fall through to protobuf parser.
  }
  return parseProtobufTurn(data, langTgt);
}

export default function LiveSession({
  domain, langSrc, langTgt, onTurns, onMicState, onPipelineStatus, onSessionReady,
}: LiveSessionProps) {
  const [steps, setSteps] = useState<Record<string, StepState>>({
    engine: 'pending',
    mic: 'pending',
    channel: 'pending',
    agent: 'pending',
    rtt: 'pending',
  });
  const [error, setError] = useState<string | null>(null);
  const [micDenied, setMicDenied] = useState(false);

  const agoraClientRef = useRef<any>(null);
  const micTrackRef = useRef<any>(null);
  const sessionIdRef = useRef<string | null>(null);
  const agentIdRef = useRef<string | null>(null);
  const rttAgentIdRef = useRef<string | null>(null);
  const channelRef = useRef<string | null>(null);
  const uidRef = useRef<string | null>(null);
  const tokenRef = useRef<string | null>(null);
  const turnIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const updateStep = useCallback((key: string, state: StepState) => {
    if (!mountedRef.current) return;
    setSteps((prev) => ({ ...prev, [key]: state }));
  }, []);

  // ── Hardware/Mobile Guard: Prevent screen sleep ──
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('[Hardware] Screen Wake Lock active in LiveSession');
        }
      } catch (err) {
        console.error('[Hardware] Wake Lock failed:', err);
      }
    };
    requestWakeLock();
    return () => {
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, []);

  // ── Hardware/Mobile Guard: Web Audio Context Suspension Recovery ──
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && agoraClientRef.current) {
        // iOS Safari suspends Web Audio API on background/calls. Must explicitly resume.
        // @ts-ignore
        const ctx = agoraClientRef.current.getAudioContext?.();
        if (ctx && ctx.state === 'suspended') {
          console.warn('[Hardware] Resuming suspended Web Audio Context...');
          ctx.resume().catch(console.error);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Also trigger on touch/click in case visibility change isn't enough
    document.addEventListener('touchstart', handleVisibilityChange, { once: true });
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('touchstart', handleVisibilityChange);
    };
  }, []);

  // ── On mount: connect to Agora ──
  useEffect(() => {
    let cancelled = false;
    let localClient: any = null;

    (async () => {
      try {
        // Step 1: Initialize Agora CAI Engine
        updateStep('engine', 'running');
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        localClient = client;
        agoraClientRef.current = client;
        onPipelineStatus((prev) => ({ ...prev, cai: 'initializing' }));

        if (cancelled) return;
        updateStep('engine', 'done');
        onPipelineStatus((prev) => ({ ...prev, cai: 'active' }));

        // Step 2: Request microphone
        updateStep('mic', 'running');
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((t) => t.stop());
        } catch {
          setMicDenied(true);
          updateStep('mic', 'error');
          setError('Microphone access denied. Enable microphone in browser settings and reload.');
          return;
        }
        if (cancelled) return;
        updateStep('mic', 'done');

        // Step 3: Start session — get token, channel, uid
        updateStep('channel', 'running');
        const sessionRes = await fetch('/api/session/start', { method: 'POST' });
        if (!sessionRes.ok) throw new Error('Failed to start session: ' + (await sessionRes.text()));
        const sessionData = await sessionRes.json();
        sessionIdRef.current = sessionData.sessionId;
        channelRef.current = sessionData.channel;
        uidRef.current = sessionData.uid;
        tokenRef.current = sessionData.token;

        await client.join(sessionData.appId, sessionData.channel, sessionData.token, parseInt(sessionData.uid));
        if (cancelled) return;
        updateStep('channel', 'done');
        onPipelineStatus((prev) => ({ ...prev, sdrtn: 'connected' }));

        // Step 4: Start CAI agent
        updateStep('agent', 'running');
        const agentRes = await fetch('/api/session/agent/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: sessionData.channel,
            uid: sessionData.uid,
            domain,
            langSrc,
            langTgt,
          }),
        });
        if (!agentRes.ok) {
          const errData = await agentRes.json().catch(() => ({}));
          throw new Error(errData.error || 'Agent start failed');
        }
        const agentData = await agentRes.json();
        agentIdRef.current = agentData.agentId ?? agentData.agent_id ?? null;
        if (cancelled) return;
        updateStep('agent', 'done');

        // Step 5: Start RTT translation
        updateStep('rtt', 'running');
        const rttRes = await fetch('/api/session/rtt/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionData.sessionId,
            channel: sessionData.channel,
            langSrc,
            langTgt,
          }),
        });
        if (rttRes.ok) {
          const rttData = await rttRes.json().catch(() => ({}));
          rttAgentIdRef.current = rttData.rttAgentId ?? rttData.agentId ?? null;
          if (!cancelled) {
            updateStep('rtt', 'done');
            onPipelineStatus((prev) => ({ ...prev, rtt: 'running', solana: 'standby' }));
          }
        } else {
          const rttData = await rttRes.json().catch(() => ({}));
          if (rttRes.status === 501) {
            // RTT not configured — that's OK, agent-only mode
            updateStep('rtt', 'done');
            onPipelineStatus((prev) => ({ ...prev, rtt: 'standby', solana: 'standby' }));
          } else {
            throw new Error(rttData.error || 'RTT start failed');
          }
        }

        if (cancelled) return;
        onSessionReady();

        // Auto-publish mic — guard against Agora SDK race condition
        try {
          console.log('[Hardware] Connection state before mic publish:', client.connectionState);

          // Wait for CONNECTED if not already there
          if (client.connectionState !== 'CONNECTED') {
            console.log('[Hardware] Waiting for CONNECTED state before publishing mic...');
            await new Promise<void>((resolve, reject) => {
              const timeout = setTimeout(() => reject(new Error('Agora connection timeout (5s)')), 5000);
              const handler = (curState: string) => {
                console.log('[Hardware] State change while waiting:', curState);
                if (curState === 'CONNECTED') {
                  clearTimeout(timeout);
                  client.off('connection-state-change', handler);
                  resolve();
                } else if (curState === 'DISCONNECTED' || curState === 'FAILED') {
                  clearTimeout(timeout);
                  client.off('connection-state-change', handler);
                  reject(new Error(`Agora connection dropped: ${curState}`));
                }
              };
              client.on('connection-state-change', handler);
            });
          }

          console.log('[Hardware] State at publish time:', client.connectionState);
          const track = await AgoraRTC.createMicrophoneAudioTrack({
            AEC: true,
            ANS: true,
            AGC: true,
          });
          micTrackRef.current = track;
          await client.publish(track);
          onMicState('listening');
          console.log('[Hardware] ✅ Microphone auto-published to channel');
        } catch (micErr) {
          console.warn('[Hardware] Auto mic publish failed:', micErr);
          onMicState('error');
        }

        // Step 6: Hardware/Network resilience listener
        client.on('connection-state-change', (curState) => {
          if (!mountedRef.current) return;
          console.log(`[Hardware] Connection state changed: ${curState}`);
          if (curState === 'RECONNECTING') {
            onPipelineStatus((prev) => ({ ...prev, sdrtn: 'reconnecting' as any }));
          } else if (curState === 'CONNECTED') {
            onPipelineStatus((prev) => ({ ...prev, sdrtn: 'connected' }));
          }
        });

        // Step 6.5: Subscribe to remote agent audio
        client.on('user-published', async (user, mediaType) => {
          if (!mountedRef.current) return;
          console.log('[Hardware] Remote user published:', user.uid, mediaType);
          await client.subscribe(user, mediaType);
          if (mediaType === 'audio') {
            const remoteAudioTrack = user.audioTrack;
            if (remoteAudioTrack) {
              remoteAudioTrack.play();
              console.log('[Hardware] Playing remote audio from:', user.uid);
            }
          }
        });

        client.on('user-unpublished', (user) => {
          console.log('[Hardware] Remote user unpublished:', user.uid);
        });

        // Step 7: Listen for stream messages
        client.on('stream-message', (_uid: string | number, data: Uint8Array) => {
          if (!mountedRef.current) return;
          try {
            const parsed = parseStreamTurn(data, langTgt);
            if (!parsed) return;

            const latency = Date.now() - parsed.timestamp;
            const turnId = turnIdRef.current++;

            onTurns((prev) => [...prev, {
              id: turnId,
              sourceText: parsed.sourceText,
              translatedText: parsed.translatedText,
              latencyMs: Math.max(0, latency),
              model: domain === 'maritime' ? 'gpt-realtime-2' : 'gpt-realtime-translate',
              hashConfirmed: false,
              timestamp: Date.now(),
              isFinal: parsed.isFinal,
            }]);

            if (!parsed.isFinal || !parsed.sourceText || !parsed.translatedText) return;

            fetch('/api/audit/hash', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                viText: parsed.sourceText,
                enText: parsed.translatedText,
                sessionId: sessionData.sessionId,
              }),
            }).then((r) => r.json()).then((d) => {
              if (!d.hash) return null;
              return fetch('/api/solana/record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  hash: d.hash,
                  timestamp: Date.now(),
                  channelName: sessionData.channel,
                  domain,
                  messageCount: turnId + 1,
                }),
              });
            }).then(async (response) => {
              if (!response) return;
              const solData = await response.json().catch(() => ({}));
              if (response.ok && solData.success && mountedRef.current) {
                onPipelineStatus((prev) => ({ ...prev, solana: 'connected' }));
                onTurns((prev) => prev.map((turn) => {
                  if (turn.id !== turnId) return turn;
                  return { ...turn, hashConfirmed: true };
                }));
              } else {
                onPipelineStatus((prev) => ({ ...prev, solana: 'error' }));
              }
            }).catch(() => {
              onPipelineStatus((prev) => ({ ...prev, solana: 'error' }));
            });
          } catch {}
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (!cancelled) {
          setError(msg);
          onMicState('error');
        }
      }
    })();

    return () => { 
      cancelled = true; 
      const sid = sessionIdRef.current;
      if (sid) {
        fetch('/api/session/end', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sid,
            agentId: agentIdRef.current,
            rttAgentId: rttAgentIdRef.current,
          }),
        }).catch(() => {});
      }
      if (micTrackRef.current) {
        try { micTrackRef.current.stop(); micTrackRef.current.close(); } catch {}
      }
      if (localClient) {
        try { localClient.leave(); } catch {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mic toggle ──
  const toggleMic = useCallback(async () => {
    const client = agoraClientRef.current;
    if (!client) return;

    if (!micTrackRef.current) {
      // Start mic
      try {
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
        const track = await AgoraRTC.createMicrophoneAudioTrack({
          AEC: true,
          ANS: true,
          AGC: true,
        });
        micTrackRef.current = track;
        await client.publish(track);
        onMicState('listening');
      } catch {
        onMicState('error');
      }
    } else {
      // Stop mic
      try {
        await client.unpublish(micTrackRef.current);
        micTrackRef.current.stop();
        micTrackRef.current.close();
        micTrackRef.current = null;
        onMicState('idle');
      } catch {
        onMicState('error');
      }
    }
  }, [onMicState]);

  // Expose toggleMic to parent
  useEffect(() => {
    (window as any).__wavelensToggleMic = toggleMic;
    return () => { delete (window as any).__wavelensToggleMic; };
  }, [toggleMic]);

  // ── Render loading checklist ──
  const allDone = Object.values(steps).every((s) => s === 'done');
  const hasError = Object.values(steps).some((s) => s === 'error');

  if (!allDone) {
    return (
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-sm w-full space-y-3">
          {[
            { key: 'engine', label: 'Initializing Agora CAI Engine...' },
            { key: 'mic', label: 'Requesting microphone access...' },
            { key: 'channel', label: 'Joining channel...' },
            { key: 'agent', label: 'Starting voice agent...' },
            { key: 'rtt', label: 'Starting RTT translation...' },
          ].map((step) => {
            const state = steps[step.key];
            return (
              <div key={step.key} className="flex items-center gap-2.5 text-sm">
                {state === 'pending' && <span className="w-4 h-4 rounded-full border-2 border-[#334155]" />}
                {state === 'running' && <Loader2 className="w-4 h-4 text-[#FF6B35] animate-spin shrink-0" />}
                {state === 'done' && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                {state === 'error' && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                <span className={state === 'done' ? 'text-green-400' : state === 'error' ? 'text-red-400' : state === 'running' ? 'text-[#FF6B35]' : 'text-[#64748B]'}>
                  {step.label}
                </span>
              </div>
            );
          })}
          {micDenied && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-xs text-red-400">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Microphone access denied. Enable microphone in browser settings and reload.
            </div>
          )}
          {error && !micDenied && (
            <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-xs text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
