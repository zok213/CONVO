'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  useRTCClient,
  useJoin,
  useLocalMicrophoneTrack,
  usePublish,
  useClientEvent,
} from 'agora-rtc-react';
import { decodeSttMessage } from '@/lib/agora-stt';
import { SubtitleOverlay } from './SubtitleOverlay';
import SessionSummary from './SessionSummary';
import { BilingualTranscriptPanel } from './BilingualTranscriptPanel';
import type { TranscriptEntry } from './BilingualTranscriptPanel';

const DEMO_PHRASES = [
  'Hello, welcome to the real-time translator.',
  'This simulates live transcription and translation.',
  'Speech is converted to text in real time.',
  'Translated text appears here as subtitles.',
  'Text-to-speech reads the translation aloud.',
  'Pair bone conduction headphones for deaf-accessible audio.',
  'The system uses Agora RTC for audio streaming.',
  'Translation happens via AI-powered speech recognition.',
  'You can test the full pipeline without credentials.',
  'This demo verifies subtitle animation and TTS audio.',
];

interface TranslatorSessionProps {
  channel?: string;
  token?: string;
  uid?: string;
  sourceLanguage: string;
  targetLanguages: string[];
  domain?: 'maritime' | 'coaching';
  onEnd: () => void;
  demoMode?: boolean;
}

const MAX_IDLE_MS = 300000; // 5 min

export default function TranslatorSession({
  channel,
  token,
  uid,
  sourceLanguage,
  targetLanguages,
  domain = 'coaching',
  onEnd,
  demoMode = false,
}: TranslatorSessionProps) {
  const client = useRTCClient();
  const sttStartedRef = useRef(false);
  const demoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const demoPhraseRef = useRef(0);
  const sessionStartTimeRef = useRef(Date.now());
  const sessionEndedRef = useRef(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [sessionData, setSessionData] = useState<{
    channelName: string;
    domain: string;
    duration: number;
    messageCount: number;
    hash: string;
    sessionId?: string;
  } | null>(null);

  // StrictMode guard
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(() => {
      if (!cancelled) setIsReady(true);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(id);
      setIsReady(false);
    };
  }, []);

  // Only join RTC when NOT in demo mode
  const joinEnabled = isReady && !demoMode;
  const { isConnected: joinSuccess } = useJoin(
    {
      appid: process.env.NEXT_PUBLIC_AGORA_APP_ID!,
      channel: channel ?? '',
      token: token ?? '',
      uid: uid ? parseInt(uid, 10) : 0,
    },
    joinEnabled,
  );

  const { localMicrophoneTrack } = useLocalMicrophoneTrack(isReady && !demoMode);
  usePublish([localMicrophoneTrack]);

  // STT agent state
  const [sttAgentId, setSttAgentId] = useState<string | null>(null);
  const sttAgentIdRef = useRef<string | null>(null);
  const [sttError, setSttError] = useState<string | null>(null);

  // Subtitles
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [transcriptHistory, setTranscriptHistory] = useState<string[]>([]);
  const lastActivityRef = useRef(Date.now());

  // Transcript history
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([]);
  const entryIdRef = useRef(0);

  // Start STT agent once RTC is joined (skip in demo mode)
  useEffect(() => {
    if (demoMode) return;
    if (!isReady || !joinSuccess || sttStartedRef.current) return;
    sttStartedRef.current = true;

    const uid1 = String(Math.floor(Math.random() * 90000) + 10000);
    const uid2 = String(Math.floor(Math.random() * 90000) + 10000);

    (async () => {
      try {
        const res = await fetch('/api/stt-translation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channelName: channel,
            languages: [sourceLanguage],
            sourceLanguage,
            targetLanguages,
            domain,
            subBotUid: uid1,
            pubBotUid: uid2,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          const detail = data.detail ? (typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail)) : '';
          throw new Error((data.error || 'STT API error') + (detail ? ': ' + detail : ''));
        }
        sttAgentIdRef.current = data.agentId;
        setSttAgentId(data.agentId);
      } catch (err) {
        setSttError(err instanceof Error ? err.message : String(err));
      }
    })();
  }, [isReady, joinSuccess, channel, sourceLanguage, targetLanguages, domain, demoMode]);

  // Demo subtitle generator (runs instead of live STT)
  useEffect(() => {
    if (!demoMode || !isReady) return;

    // Start cycling demo phrases
    setCurrentSubtitle(DEMO_PHRASES[0]);
    demoPhraseRef.current = 0;

    demoIntervalRef.current = setInterval(() => {
      demoPhraseRef.current = (demoPhraseRef.current + 1) % DEMO_PHRASES.length;
      setCurrentSubtitle(DEMO_PHRASES[demoPhraseRef.current]);
    }, 4000);

    return () => {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
        demoIntervalRef.current = null;
      }
    };
  }, [demoMode, isReady]);

  // Cleanup STT agent on unmount
  useEffect(() => {
    return () => {
      const id = sttAgentIdRef.current;
      if (id) {
        fetch('/api/stt-translation', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agentId: id }),
        }).catch(() => {});
      }
    };
  }, []);

  // Handle STT stream messages (live mode only)
  useClientEvent(client, 'stream-message', (_uid: string | number, data: Uint8Array) => {
    if (demoMode) return;
    const msg = decodeSttMessage(data);
    if (!msg || msg.dataType !== 'translate') return;

    for (const t of msg.translations) {
      if (t.isFinal && t.texts.length > 0) {
        setCurrentSubtitle(t.texts.join(' '));
      }
    }

    // Add transcript entry
    const sourceText = (msg.transcript ?? '').trim();
    const translated = msg.translations[0];
    if (!sourceText && !translated?.texts.length) return;

    const translatedText = translated ? translated.texts.join(' ') : '';
    const isFinal = translated?.isFinal ?? false;

    setTranscriptEntries((prev) => {
      // Update last entry if it's still non-final
      if (!isFinal && prev.length > 0) {
        const last = prev[prev.length - 1];
        if (!last.isFinal) {
          return prev.map((entry, i) =>
            i === prev.length - 1
              ? { ...entry, sourceText, translatedText, timestamp: Date.now() }
              : entry,
          );
        }
      }
      return [
        ...prev,
        {
          id: String(++entryIdRef.current),
          sourceText,
          translatedText,
          timestamp: msg.time || Date.now(),
          isFinal,
          speaker: 'user' as const,
        },
      ];
    });
  });

  // Mic toggle
  const [micEnabled, setMicEnabled] = useState(true);
  const handleMicToggle = useCallback(async () => {
    const next = !micEnabled;
    if (localMicrophoneTrack) {
      await localMicrophoneTrack.setEnabled(next);
    }
    setMicEnabled(next);
  }, [micEnabled, localMicrophoneTrack]);

  const computeHash = useCallback(async (data: Record<string, unknown>): Promise<string> => {
    try {
      const str = JSON.stringify(data);
      const encoder = new TextEncoder();
      const buf = encoder.encode(str);
      const hashBuf = await crypto.subtle.digest('SHA-256', buf);
      const hashArr = Array.from(new Uint8Array(hashBuf));
      return hashArr.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      return 'unavailable';
    }
  }, []);

  const endSession = useCallback(async () => {
    if (sessionEndedRef.current) return;
    sessionEndedRef.current = true;

    const duration = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);

    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }

    const agentId = sttAgentIdRef.current;
    if (agentId) {
      fetch('/api/stt-translation', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId }),
      }).catch(() => {});
    }

    const channelName = channel ?? 'demo-session';
    const transcriptSummary = transcriptHistory.slice(-5).join(' | ');

    try {
      const res = await fetch('/api/log-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelName,
          timestamp: new Date().toISOString(),
          domain,
          messageCount: transcriptHistory.length,
          transcriptSummary,
          deviceInfo: navigator.userAgent,
        }),
      });
      const data = await res.json();
      const hash = await computeHash({
        channelName,
        domain,
        duration,
        messageCount: transcriptHistory.length,
        sessionId: data.sessionId,
      });
      setSessionData({
        channelName,
        domain,
        duration,
        messageCount: transcriptHistory.length,
        hash,
        sessionId: data.success ? data.sessionId : undefined,
      });
    } catch {
      const hash = await computeHash({
        channelName,
        domain,
        duration,
        messageCount: transcriptHistory.length,
      });
      setSessionData({
        channelName,
        domain,
        duration,
        messageCount: transcriptHistory.length,
        hash,
      });
    }

    setSessionEnded(true);
  }, [channel, domain, transcriptHistory, computeHash]);

  // Idle detection
  useEffect(() => {
    const interval = setInterval(() => {
      if (sessionEndedRef.current) return;
      if (Date.now() - lastActivityRef.current > MAX_IDLE_MS) {
        endSession();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [endSession]);

  useEffect(() => {
    if (currentSubtitle) lastActivityRef.current = Date.now();
  }, [currentSubtitle]);

  // Track transcript history
  useEffect(() => {
    if (!currentSubtitle) return;
    setTranscriptHistory((prev) => [...prev, currentSubtitle]);
  }, [currentSubtitle]);

  if (sessionEnded) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center bg-black p-4">
        {sessionData && (
          <SessionSummary
            channelName={sessionData.channelName}
            domain={sessionData.domain}
            duration={sessionData.duration}
            messageCount={sessionData.messageCount}
            hash={sessionData.hash}
            sessionId={sessionData.sessionId}
          />
        )}
        <button
          onClick={onEnd}
          className="mt-4 rounded-lg bg-white/10 px-6 py-2 text-sm text-white/70 transition-colors hover:bg-white/20"
        >
          Leave
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex h-dvh w-full flex-col bg-black text-white overflow-hidden">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <div
            className={
              'h-2 w-2 rounded-full ' +
              (demoMode ? 'bg-yellow-400' : joinSuccess ? 'bg-green-500' : 'bg-yellow-500 animate-pulse')
            }
          />
          <span className="text-xs text-white/70">
            {demoMode ? 'Demo Mode' : joinSuccess ? 'Connected' : 'Connecting...'}
          </span>
          {sttAgentId && (
            <span className="text-xs text-green-400/70">
              STT active
            </span>
          )}
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/60">
            {domain === 'maritime' ? 'âš“ Maritime' : 'ðŸŠ Coaching'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMicToggle}
            className={
              'rounded-full p-2 transition-colors ' +
              (micEnabled ? 'bg-white/20 text-white' : 'bg-red-500/30 text-red-400')
            }
            aria-label={micEnabled ? 'Mute' : 'Unmute'}
          >
            {micEnabled ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="2" width="6" height="11" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><line x1="12" y1="19" x2="12" y2="22" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12" /><path d="M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2" /><line x1="12" y1="19" x2="12" y2="22" /></svg>
            )}
          </button>

          <button
            onClick={endSession}
            className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-medium hover:bg-red-600 transition-colors"
          >
            End
          </button>
        </div>
      </div>

      {/* Error banner */}
      {sttError && !demoMode && (
        <div className="mx-4 mt-2 rounded-md bg-red-500/20 p-3 text-sm text-red-300">
          STT Error: {sttError}
          <p className="mt-1 text-xs text-red-400/70">
            Make sure AGORA_CUSTOMER_ID and AGORA_CUSTOMER_SECRET are set in .env.local
          </p>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-hidden">
          <BilingualTranscriptPanel
            entries={transcriptEntries}
            sourceLanguage={sourceLanguage}
            targetLanguage={targetLanguages[0] ?? 'en-US'}
          />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <SubtitleOverlay text={currentSubtitle} />
        </div>
      </div>

      {/* Language info footer */}
      <div className="px-4 py-3 text-center text-xs text-white/40">
        {sourceLanguage} -&gt; {targetLanguages.join(', ')}
      </div>
    </div>
  );
}
