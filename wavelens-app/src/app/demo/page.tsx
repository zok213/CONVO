'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Mic, Square, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Turn, Domain } from '@/components/LiveSession';

type LangPair = { source: string; target: string; label: string };
type MicState = 'idle' | 'listening' | 'translating' | 'error' | 'connecting';

const LANG_PAIRS: LangPair[] = [
  { source: 'vi-VN', target: 'en-US', label: 'VI → EN' },
  { source: 'vi-VN', target: 'zh-CN', label: 'VI → ZH' },
  { source: 'vi-VN', target: 'ko-KR', label: 'VI → KO' },
  { source: 'en-US', target: 'vi-VN', label: 'EN → VI' },
];

function formatDuration(s: number): string {
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

const LiveSession = dynamic(() => import('@/components/LiveSession'), { ssr: false });

// ═══ Canvas Waveform — Circular Oscilloscope ═══
function WaveformStage({ micState }: { micState: MicState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const rafRef = useRef<number>(0);
  const noiseRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Seed noise buffer for organic spike variation
    if (noiseRef.current.length === 0) {
      noiseRef.current = Array.from({ length: 360 }, () => Math.random());
    }

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const baseR = Math.min(w, h) * 0.28;

      const t = offsetRef.current;
      const isListening = micState === 'listening';
      const isTranslating = micState === 'translating';
      const isIdle = micState === 'idle' || micState === 'connecting';

      // ── Outer glow ring ──
      const glowR = baseR + (isListening ? 18 + Math.sin(t * 0.07) * 8 : isTranslating ? 10 : 4);
      const glowGrad = ctx.createRadialGradient(cx, cy, glowR - 24, cx, cy, glowR + 24);
      glowGrad.addColorStop(0, 'rgba(0,255,157,0.0)');
      glowGrad.addColorStop(0.5, isListening ? 'rgba(0,255,157,0.12)' : 'rgba(0,255,157,0.04)');
      glowGrad.addColorStop(1, 'rgba(0,255,157,0.0)');
      ctx.beginPath();
      ctx.arc(cx, cy, glowR + 24, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // ── Radial spike ring ──
      const segments = 180;
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2 - Math.PI / 2;
        const noise = noiseRef.current[Math.floor(i / segments * 360)] ?? 0.5;
        const slowWave = Math.sin(angle * 3 + t * 0.04) * 0.5 + 0.5;
        const fastWave = Math.sin(angle * 7 + t * 0.09) * 0.5 + 0.5;

        let spike = 0;
        if (isListening) {
          // Organic reactive spikes
          spike = (noise * 0.4 + slowWave * 0.35 + fastWave * 0.25) * (55 + Math.sin(t * 0.05) * 20);
          // Evolve noise slowly
          if (i % 8 === 0) noiseRef.current[Math.floor(i / segments * 360)] = noise * 0.92 + Math.random() * 0.08;
        } else if (isTranslating) {
          spike = (slowWave * 0.6 + fastWave * 0.4) * (22 + Math.sin(t * 0.06) * 8);
        } else {
          spike = (Math.sin(angle * 4 + t * 0.02) * 0.5 + 0.5) * (isIdle ? 6 : 4);
        }

        const r = baseR + spike;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Fill with subtle neon tint
      const fillGrad = ctx.createRadialGradient(cx, cy, baseR * 0.5, cx, cy, baseR * 1.6);
      fillGrad.addColorStop(0, 'rgba(0,255,157,0.04)');
      fillGrad.addColorStop(1, 'rgba(0,255,157,0.0)');
      ctx.fillStyle = fillGrad;
      ctx.fill();

      // Stroke the spike ring
      ctx.lineWidth = isListening ? 2.5 : 2;
      ctx.strokeStyle = '#00FF9D';
      ctx.shadowBlur = isListening ? 18 : isTranslating ? 10 : 6;
      ctx.shadowColor = '#00FF9D';
      ctx.stroke();
      ctx.shadowBlur = 0;

      // ── Inner base circle ──
      ctx.beginPath();
      ctx.arc(cx, cy, baseR * 0.08, 0, Math.PI * 2);
      ctx.fillStyle = '#00FF9D';
      ctx.shadowBlur = 16;
      ctx.shadowColor = '#00FF9D';
      ctx.fill();
      ctx.shadowBlur = 0;

      // ── Concentric pulse ring ──
      if (isListening) {
        const pulseR = baseR * (0.35 + Math.sin(t * 0.06) * 0.05);
        ctx.beginPath();
        ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,255,157,0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      offsetRef.current++;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, [micState]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}


// ═══ Current turn live output ═══
function LiveOutput({ turn, micState }: { turn: Turn | null; micState: MicState }) {
  const [prevTurn, setPrevTurn] = useState<Turn | null>(null);
  const [showPrev, setShowPrev] = useState(false);

  useEffect(() => {
    if (turn && turn.id !== prevTurn?.id) {
      if (prevTurn) {
        setShowPrev(true);
        setTimeout(() => { setShowPrev(false); setPrevTurn(turn); }, 200);
      } else {
        setPrevTurn(turn);
      }
    }
  }, [turn, prevTurn?.id]);

  if (!turn && micState === 'idle') {
    return <div className="text-center"><span className="text-5xl sm:text-7xl text-[#2A2A2A] font-light">—</span></div>;
  }

  if (!turn) return null;

  return (
    <div className="text-center max-w-2xl mx-auto px-4">
      {/* VI text */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <svg className="w-3.5 h-3.5 text-[#FF6B35] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="2" width="6" height="11" rx="3" /><path d="M5 10a7 7 0 0 0 14 0" /><line x1="12" y1="19" x2="12" y2="22" />
        </svg>
        <span className="text-[clamp(14px,2vw,18px)] text-[#4A4A4A] font-mono">{turn.sourceText}</span>
      </div>
      {/* EN text - crossfade */}
      <div className="relative h-[clamp(36px,6vw,72px)] flex items-center justify-center">
        {showPrev && prevTurn && prevTurn.id !== turn.id && (
          <span key={`old-${prevTurn.id}`} className="absolute inset-0 flex items-center justify-center text-[clamp(24px,4vw,48px)] text-[#FFFFFF] font-semibold tracking-[-0.02em] animate-fadeOut">{prevTurn.translatedText}</span>
        )}
        <span key={turn.id} className="absolute inset-0 flex items-center justify-center text-[clamp(24px,4vw,48px)] text-[#FFFFFF] font-semibold tracking-[-0.02em] animate-fadeSlideIn">
          {turn.translatedText}
        </span>
      </div>
      {/* Metadata */}
      <div className="flex items-center justify-center gap-3 mt-3 text-xs font-mono">
        <span className="text-[#FF6B35]">↯ {turn.latencyMs}ms</span>
        <span className="text-[#00D4FF]">{turn.model}</span>
        <span className={turn.hashConfirmed ? 'text-[#9B59B6]' : 'text-[#333]'}>
          {turn.hashConfirmed ? '✓ Solana' : '○ pending'}
        </span>
      </div>
    </div>
  );
}

// ═══ Context Drawer ═══
const GLOSSARY_TERMS = [
  { vi: 'két ballast', en: 'ballast tank', criticality: 'critical' as const },
  { vi: 'bơm bi-lô', en: 'bilge pump', criticality: 'high' as const },
  { vi: 'người rơi xuống biển', en: 'man overboard', criticality: 'critical' as const },
  { vi: 'trạm tập hợp', en: 'muster station', criticality: 'high' as const },
  { vi: 'cần cẩu cổng', en: 'gantry crane', criticality: 'normal' as const },
  { vi: 'máy chính', en: 'main engine', criticality: 'high' as const },
  { vi: 'bơm cứu hỏa', en: 'fire pump', criticality: 'critical' as const },
  { vi: 'cầu tàu', en: 'pier / dock', criticality: 'normal' as const },
];

function ContextDrawer({ open, onClose, domain, langPair, turns, avgLatency, sessionDuration, confirmedHashes, pipelineStatus }: {
  open: boolean; onClose: () => void; domain: Domain; langPair: LangPair; turns: Turn[];
  avgLatency: number | null; sessionDuration: number; confirmedHashes: number; pipelineStatus: Record<string, string>;
}) {
  const statusDot = (s: string) => {
    const c = s === 'connected' || s === 'active' || s === 'running' ? '#00FF9D' : s === 'initializing' ? '#00D4FF' : s === 'standby' ? '#333' : '#EF4444';
    const glow = s === 'connected' || s === 'active' || s === 'running' ? 'shadow-[0_0_6px_#00FF9D]' : '';
    return <span className={`inline-block w-2 h-2 rounded-full ${glow}`} style={{ backgroundColor: c }} />;
  };
  const statusLabel = (s: string) => s === 'connected' || s === 'active' ? 'Connected' : s === 'running' ? 'Running' : s === 'initializing' ? 'Initializing' : s === 'standby' ? 'Standby' : 'Disconnected';

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />}
      <div className={`fixed top-0 right-0 bottom-0 z-50 bg-[#0A0A0A] border-l border-[#1A1A1A] transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ width: 'clamp(300px, 30vw, 380px)' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
          <span className="text-[#333] text-[10px] uppercase tracking-[0.15em] font-mono">Context</span>
          <button onClick={onClose} className="text-[#333] hover:text-white transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 space-y-5 h-full pb-20">
          {/* Active Context */}
          <div>
            <h3 className="text-[10px] text-[#333] uppercase tracking-[0.15em] font-mono mb-2">Active Context</h3>
            <div className="space-y-1.5">
              {[
                ['Model', 'gpt-realtime-2'],
                ['Domain', domain === 'maritime' ? 'Maritime / Industrial' : 'Coaching / General'],
                ['Glossary', domain === 'maritime' ? `${GLOSSARY_TERMS.length} terms` : 'No glossary'],
                ['Language', `${langPair.source.split('-')[0].toUpperCase()} → ${langPair.target.split('-')[0].toUpperCase()}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-[#666] font-mono">{label}</span>
                  <span className="text-xs text-[#FFF] font-mono">{value}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Glossary */}
          {domain === 'maritime' && (
            <div>
              <h3 className="text-[10px] text-[#333] uppercase tracking-[0.15em] font-mono mb-2">Maritime Glossary</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {GLOSSARY_TERMS.map((t) => (
                  <div key={t.vi} className="flex items-center justify-between py-0.5">
                    <span className="text-xs text-[#666]">{t.vi}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#FFF]">{t.en}</span>
                      {t.criticality === 'critical' && <span className="text-[9px] px-1 py-0.5 rounded text-[#EF4444] border border-[rgba(239,68,68,0.3)] leading-none">CRITICAL</span>}
                      {t.criticality === 'high' && <span className="text-[9px] px-1 py-0.5 rounded text-[#FDBA74] border border-[rgba(251,146,60,0.3)] leading-none">HIGH</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Metrics */}
          <div>
            <h3 className="text-[10px] text-[#333] uppercase tracking-[0.15em] font-mono mb-2">Session Metrics</h3>
            <div className="space-y-1.5">
              {[
                ['Turns', String(turns.length)],
                ['Avg latency', avgLatency ? `${avgLatency}ms` : '—'],
                ['Duration', formatDuration(sessionDuration)],
                ['Solana receipts', `${confirmedHashes}`],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-[#666] font-mono">{label}</span>
                  <span className="text-xs text-[#FFF] font-mono">{value}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Pipeline */}
          <div>
            <h3 className="text-[10px] text-[#333] uppercase tracking-[0.15em] font-mono mb-2">Pipeline</h3>
            <div className="space-y-2">
              {[
                ['Agora SDRTN', pipelineStatus.sdrtn],
                ['CAI Engine', pipelineStatus.cai],
                ['RTT', pipelineStatus.rtt],
                ['Solana RPC', pipelineStatus.solana],
              ].map(([label, status]) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {statusDot(status)}
                    <span className="text-xs text-[#666] font-mono">{label}</span>
                  </div>
                  <span className="text-xs font-mono" style={{ color: status === 'connected' || status === 'active' || status === 'running' ? '#00FF9D' : '#333' }}>{statusLabel(status)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ═══ Main Page ═══
export default function DemoPage() {
  const [domain, setDomain] = useState<Domain>('maritime');
  const [langPair, setLangPair] = useState<LangPair>(LANG_PAIRS[0]);
  const [micState, setMicState] = useState<MicState>('idle');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [sessionReady, setSessionReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState<Record<string, string>>({
    sdrtn: 'disconnected', cai: 'disconnected', rtt: 'standby', solana: 'standby',
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!sessionReady) return;
    timerRef.current = setInterval(() => setSessionDuration((p) => p + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [sessionReady]);

  const avgLatency = turns.length > 0 ? Math.round(turns.reduce((s, t) => s + t.latencyMs, 0) / turns.length) : null;
  const confirmedHashes = turns.filter((t) => t.hashConfirmed).length;
  const lastTurn = turns.length > 0 ? turns[turns.length - 1] : null;
  const lastLatency = lastTurn?.latencyMs ?? null;
  const sessionKey = `${domain}-${langPair.source}-${langPair.target}`;
  const micLevel = Math.max(0, Math.min(100, Number(pipelineStatus.micLevel ?? 0)));
  const micInputLow = pipelineStatus.micInput === 'low';

  useEffect(() => {
    setSessionReady(false);
    setTurns([]);
    setSessionDuration(0);
    setMicState('connecting');
    setPipelineStatus({
      sdrtn: 'disconnected',
      cai: 'disconnected',
      rtt: 'standby',
      solana: 'standby',
      micInput: 'ok',
      micLevel: '0',
    });
  }, [sessionKey]);

  const toggleMic = useCallback(() => {
    const fn = (window as any).__wavelensToggleMic;
    if (fn) {
      fn();
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;
        
        if (micState === 'idle') {
          // Turning ON: crisp ascending beep
          osc.type = 'sine';
          osc.frequency.setValueAtTime(500, now);
          osc.frequency.exponentialRampToValueAtTime(1000, now + 0.08);
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
          gain.gain.linearRampToValueAtTime(0, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
        } else {
          // Turning OFF: soft descending beep
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
          gain.gain.linearRampToValueAtTime(0, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
        }
      } catch (e) {
        console.warn('Audio API failed to play UI sound', e);
      }
    }
  }, [micState]);

  return (
    <div className="fixed inset-0 z-[9998] flex flex-col bg-[#000] text-white overflow-hidden">
      {/* ═══ Header ═══ */}
      <header className="relative h-12 flex items-center justify-between px-3 sm:px-4 z-20 shrink-0" style={{ background: 'transparent' }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-white/70 hover:text-white transition-colors no-underline font-mono">← Back</Link>
          <span className="text-sm font-semibold text-[#00FF9D] font-mono hidden sm:inline" style={{ textShadow: '0 0 10px rgba(0,255,157,0.5)' }}>WaveLens Lite</span>
        </div>
        <div className="flex items-center gap-2">
          {(['maritime', 'coaching'] as const).map((d) => (
            <button key={d} onClick={() => setDomain(d)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all min-h-[32px] ${
                domain === d ? 'bg-[#00FF9D] text-black font-semibold' : 'bg-[rgba(255,255,255,0.08)] text-white/50 hover:text-white/80 hover:border hover:border-[#00FF9D]/30'
              }`}>
              {d === 'maritime' ? '⚓ Maritime' : '🏊 Coaching'}
            </button>
          ))}
        </div>
        <select value={`${langPair.source}-${langPair.target}`}
          onChange={(e) => { const p = LANG_PAIRS.find((p) => `${p.source}-${p.target}` === e.target.value); if (p) setLangPair(p); }}
          className="bg-transparent border border-white/20 rounded-full px-3 py-1 text-xs text-white font-mono min-h-[32px] appearance-none text-center focus:outline-none">
          {LANG_PAIRS.map((p) => <option key={p.label} value={`${p.source}-${p.target}`}>{p.label}</option>)}
        </select>
      </header>

      {/* ═══ Waveform Stage — fills center of screen ═══ */}
      <div className="relative flex-1 min-h-0 flex flex-col">
        <div className="flex-1 w-full relative min-h-0">
          <WaveformStage micState={micState} />
          {/* State label below canvas */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <span className={`text-xs font-mono ${
              micInputLow ? 'text-[#FDBA74] animate-blink' :
              micState === 'listening' ? 'text-[#FF6B35] animate-blink' :
              micState === 'translating' ? 'text-[#00D4FF]' :
              micState === 'connecting' ? 'text-[#00D4FF]' :
              'text-[#4A4A4A]'
            }`}>
              {!sessionReady ? 'Connecting…' :
               micState === 'idle' ? 'Ready to translate' :
               micInputLow ? 'Mic input low' :
               micState === 'listening' ? 'Listening… |' :
               micState === 'translating' ? 'Translating…' :
               'Error'}
            </span>
          </div>
        </div>

        {/* ═══ Live Translation Output ═══ */}
        <div className="h-[20vh] sm:h-[20vh] flex items-center justify-center">
          <LiveOutput turn={lastTurn} micState={lastTurn ? micState : 'idle'} />
        </div>

        {/* ═══ Transcript Scroll ═══ */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 relative">
          <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#000] to-transparent pointer-events-none z-10" />
          <div className="max-w-2xl mx-auto">
            {[...turns].reverse().map((t, i) => (
              <div key={t.id} className="flex items-center gap-2 py-2 border-b border-[#111] text-xs sm:text-sm">
                <span className="text-[#444] truncate max-w-[30%]">{t.sourceText}</span>
                <span className="text-[#333] shrink-0">→</span>
                <span className="text-[#888] truncate flex-1">{t.translatedText}</span>
                <span className="text-[#FF6B35] font-mono text-[10px] shrink-0">{t.latencyMs}ms</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Control Bar ═══ */}
      <div className="h-[84px] bg-[#000] border-t border-[#1A1A1A] flex items-center justify-between px-4 sm:px-6 shrink-0 z-30">
        {/* Left — latency + receipts */}
        <div className="w-24 sm:w-28">
          {lastLatency ? (
            <>
              <div className="flex items-baseline gap-0.5">
                <span className="text-2xl font-mono font-bold text-[#FF6B35]">{lastLatency}</span>
                <span className="text-xs text-[#333] font-mono">ms</span>
              </div>
              <div className="text-[11px] text-[#333] font-mono">{confirmedHashes} Solana receipts</div>
            </>
          ) : (
            <>
              <span className="text-2xl font-mono font-bold text-[#333]">—</span>
              <div className="text-[11px] text-[#333] font-mono">0 receipts</div>
            </>
          )}
        </div>

        {/* Center — mic */}
        <div className="flex flex-col items-center gap-1">
          <button onClick={toggleMic} disabled={!sessionReady}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
              !sessionReady ? 'border-2 border-[#222] bg-[#000] text-[#333] cursor-not-allowed' :
              micState === 'idle' ? 'border-2 border-[#00FF9D]/30 bg-[#000] text-[#00FF9D]/60 hover:border-[#00FF9D]/60' :
              micState === 'listening' ? 'bg-[#00FF9D] text-black' :
              micState === 'translating' ? 'bg-[#00D4FF] text-white' : 'bg-[rgba(239,68,68,0.3)] text-white'
            }`}
            aria-label={micState === 'idle' ? 'Start speaking' : 'Stop'}
          >
            {/* Ripple rings */}
            {micState === 'listening' && [1, 2, 3].map((i) => (
              <span key={i} className="absolute inset-0 rounded-full border border-[rgba(0,255,157,0.4)] animate-ripple"
                style={{ animationDelay: `${i * 0.5}s` }} />
            ))}
            {!sessionReady ? (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="31.4 31.4" strokeLinecap="round" />
              </svg>
            ) : micState === 'idle' ? <Mic className="w-5 h-5" /> :
               micState === 'listening' ? <Mic className="w-5 h-5 relative z-10" /> :
               micState === 'translating' ? (
                 <svg className="w-5 h-5 relative z-10 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <circle cx="12" cy="12" r="10" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                 </svg>
               ) : <Square className="w-4 h-4" />}
          </button>
          <span className={`text-[10px] font-mono ${
            micInputLow ? 'text-[#FDBA74]' : micState === 'listening' ? 'text-[#FF6B35]' : micState === 'translating' ? 'text-[#00D4FF]' : 'text-[#333]'
          }`}>
            {!sessionReady ? 'Connecting…' : micState === 'idle' ? 'Tap to speak' : micInputLow ? 'Speak closer' : micState === 'listening' ? 'Listening' : 'Translating'}
          </span>
          <div className="h-1 w-16 rounded-full bg-[#111] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${micInputLow ? 'bg-[#FDBA74]' : 'bg-[#FF6B35]'}`}
              style={{ width: `${micState === 'listening' ? Math.max(6, micLevel) : 0}%` }}
            />
          </div>
        </div>

        {/* Right — domain + timer */}
        <div className="w-24 sm:w-28 text-right">
          <div className="text-xs text-[#333] font-mono">{domain === 'maritime' ? 'Maritime' : 'Coaching'}</div>
          <div className="text-xs text-[#444] font-mono">{formatDuration(sessionDuration)}</div>
        </div>
      </div>

      {/* ═══ Context Drawer Trigger ═══ */}
      <button onClick={() => setDrawerOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-30 w-9 h-20 bg-[rgba(255,255,255,0.03)] border border-[#1A1A1A] border-r-0 rounded-l-lg flex items-center justify-center text-white/30 hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-colors">
        <ChevronLeft className="w-3 h-3" />
      </button>

      {/* Context Drawer */}
      <ContextDrawer
        open={drawerOpen} onClose={() => setDrawerOpen(false)}
        domain={domain} langPair={langPair} turns={turns}
        avgLatency={avgLatency} sessionDuration={sessionDuration}
        confirmedHashes={confirmedHashes} pipelineStatus={pipelineStatus}
      />

      {/* ═══ LiveSession (handles Agora, shows loading when not ready) ═══ */}
      <div className={`fixed inset-0 z-30 flex items-center justify-center bg-[#000]/90 transition-opacity duration-300 ${sessionReady ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <LiveSession
          key={sessionKey}
          domain={domain} langSrc={langPair.source} langTgt={langPair.target}
          onTurns={setTurns} onMicState={setMicState}
          onPipelineStatus={setPipelineStatus} onSessionReady={() => setSessionReady(true)}
        />
      </div>

      {/* ═══ Animations ═══ */}
      <style jsx global>{`
        @keyframes ripple {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .animate-ripple { animation: ripple 1.5s ease-out infinite; }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink { animation: blink 1s step-end infinite; }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeSlideIn { animation: fadeSlideIn 300ms ease-out; }

        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        .animate-fadeOut { animation: fadeOut 200ms ease-out; }

        @media (prefers-reduced-motion: reduce) {
          .animate-ripple, .animate-blink { animation: none !important; }
          .animate-fadeSlideIn { opacity: 1 !important; transform: none !important; animation: none !important; }
          .animate-fadeOut { opacity: 0 !important; animation: none !important; }
        }
      `}</style>
    </div>
  );
}
