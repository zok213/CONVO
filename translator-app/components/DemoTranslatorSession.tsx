'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SubtitleOverlay } from '@/components/SubtitleOverlay';
import { sha256Hex } from '@/lib/solana-utils';
import type { SolanaReceiptData } from '@/lib/solana-utils';
import SolanaReceipt from '@/components/SolanaReceipt';

const DEMO_PHRASES = [
  'Hello, welcome to the real-time translator demo.',
  'This application translates speech in real time.',
  'It works with bone conduction headphones for deaf users.',
  'The audio is processed through Agora RTC streaming.',
  'Speech is transcribed and translated using AI.',
  'Translated text appears here as subtitles.',
  'Text-to-speech reads the translation aloud.',
  'This demo simulates the full pipeline without credentials.',
  'You can test the subtitle display and TTS audio output.',
  'Check your bone conduction headphones for audio feedback.',
];

const STT_LANGUAGES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'vi-VN', label: 'Vietnamese' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
  { value: 'ja-JP', label: 'Japanese' },
  { value: 'ko-KR', label: 'Korean' },
  { value: 'fr-FR', label: 'French' },
  { value: 'de-DE', label: 'German' },
  { value: 'es-ES', label: 'Spanish' },
];

export default function DemoTranslatorPage() {
  const [demoRunning, setDemoRunning] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en-US');
  const [targetLanguage, setTargetLanguage] = useState('vi-VN');
  const [receiptData, setReceiptData] = useState<SolanaReceiptData | null>(null);
  const [solanaTxId, setSolanaTxId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phraseIndexRef = useRef(0);
  const conversationListRef = useRef<{ text: string; timestamp: number }[]>([]);

  const startDemo = useCallback(() => {
    setDemoRunning(true);
    setReceiptData(null);
    conversationListRef.current = [];
    phraseIndexRef.current = 0;
    setCurrentSubtitle(DEMO_PHRASES[0]);

    intervalRef.current = setInterval(() => {
      phraseIndexRef.current = (phraseIndexRef.current + 1) % DEMO_PHRASES.length;
      setCurrentSubtitle(DEMO_PHRASES[phraseIndexRef.current]);
    }, 4000);
  }, []);

  const stopDemo = useCallback(async () => {
    setDemoRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const history = conversationListRef.current;
    if (history.length > 0) {
      const conversationText = history.map((c) => c.text).join('\n');
      const hash = await sha256Hex(conversationText);
      const receipt = {
        hash,
        timestamp: Date.now(),
        channelName: 'demo-session',
        messageCount: history.length,
        domain: 'translator-app-demo',
      };

      // Record on Solana devnet via API
      try {
        const res = await fetch('/api/solana/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(receipt),
        });
        const data = await res.json();
        if (data.success) {
          setSolanaTxId(data.txSignature);
        }
      } catch (err) {
        console.warn('[Solana] Record failed (devnet may be down):', err);
      }

      setReceiptData(receipt);
    }
  }, []);

  useEffect(() => {
    if (demoRunning && currentSubtitle) {
      conversationListRef.current.push({ text: currentSubtitle, timestamp: Date.now() });
    }
  }, [currentSubtitle, demoRunning]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <div
            className={
              'h-2 w-2 rounded-full ' +
              (demoRunning ? 'bg-green-500' : 'bg-yellow-500')
            }
          />
          <span className="text-xs text-white/70">
            {demoRunning ? 'Demo Active' : 'Demo Ready'}
          </span>
          {demoRunning && (
            <span className="text-xs text-green-400/70">
              cycling every 4s
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-white/40">
            {STT_LANGUAGES.find((l) => l.value === sourceLanguage)?.label ?? sourceLanguage} &rarr;{' '}
            {STT_LANGUAGES.find((l) => l.value === targetLanguage)?.label ?? targetLanguage}
          </span>

          {demoRunning ? (
            <button
              onClick={stopDemo}
              className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-medium hover:bg-red-600 transition-colors"
            >
              Stop Demo
            </button>
          ) : (
            <button
              onClick={startDemo}
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              Start Demo
            </button>
          )}
        </div>
      </div>

      {/* Language selector */}
      {!demoRunning && (
        <div className="flex items-center justify-center gap-4 px-4 py-4">
          <select
            value={sourceLanguage}
            onChange={(e) => setSourceLanguage(e.target.value)}
            className="rounded-md border border-white/20 bg-black px-3 py-2 text-xs text-white"
          >
            {STT_LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          <span className="text-white/40 text-sm">&rarr;</span>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="rounded-md border border-white/20 bg-black px-3 py-2 text-xs text-white"
          >
            {STT_LANGUAGES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main subtitle area */}
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        {demoRunning ? (
          <SubtitleOverlay text={currentSubtitle} />
        ) : (
          <div className="text-center">
            <p className="text-lg text-white/30 mb-4">
              Click &quot;Start Demo&quot; to test the subtitle + TTS pipeline
            </p>
            <p className="text-xs text-white/20">
              No Agora credentials required &mdash; uses simulated translation data
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 text-center text-xs text-white/30">
        Demo Mode &mdash; cycles through {DEMO_PHRASES.length} phrases to verify
        subtitle animation and TTS audio output to bone conduction headphones
      </div>

      {/* Solana Receipt */}
      {receiptData && (
        <div className="px-4 pb-6 max-w-md mx-auto w-full">
          <SolanaReceipt receiptData={receiptData} solanaTxId={solanaTxId ?? undefined} />
        </div>
      )}
    </div>
  );
}
