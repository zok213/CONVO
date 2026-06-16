'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface SubtitleOverlayProps {
  text: string;
}

export function SubtitleOverlay({ text }: SubtitleOverlayProps) {
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [displayText, setDisplayText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const textRef = useRef(text);
  textRef.current = text;

  // Animate text appearance with typewriter effect
  useEffect(() => {
    if (!text) {
      setDisplayText('');
      return;
    }

    let index = 0;
    const chars = text.split('');

    const animate = () => {
      if (index < chars.length) {
        index++;
        setDisplayText(chars.slice(0, index).join(''));
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [text]);

  // TTS: speak translated text
  const speak = useCallback(() => {
    if (!ttsEnabled || !window.speechSynthesis || !textRef.current) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textRef.current);
    utterance.lang = 'vi-VN'; // Default to Vietnamese for target
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

  // Auto-speak new translations
  useEffect(() => {
    if (text && ttsEnabled) {
      speak();
    }
  }, [text, ttsEnabled, speak]);

  // Cleanup
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-center">
      <div
        className="max-w-3xl text-center transition-all duration-300"
        aria-live="polite"
        aria-atomic="true"
      >
        {displayText ? (
          <p className="text-2xl font-medium leading-relaxed md:text-3xl lg:text-4xl text-white drop-shadow-lg">
            {displayText}
            <span className="ml-0.5 animate-pulse text-white/60">|</span>
          </p>
        ) : (
          <p className="text-lg text-white/30">
            Speak to see translation...
          </p>
        )}
      </div>

      {/* TTS indicator + toggle */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <button
          onClick={() => {
            if (isSpeaking) {
              window.speechSynthesis.cancel();
              setIsSpeaking(false);
            } else {
              setTtsEnabled((prev) => !prev);
              if (!ttsEnabled && textRef.current) {
                speak();
              }
            }
          }}
          className={
            'flex items-center gap-2 rounded-full px-4 py-2 text-xs transition-colors ' +
            (ttsEnabled
              ? isSpeaking
                ? 'bg-green-500/30 text-green-300'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
              : 'bg-white/10 text-white/40 line-through')
          }
          title={
            ttsEnabled
              ? 'TTS active - audio plays to headphones'
              : 'TTS disabled'
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
          <span>
            {isSpeaking ? 'Speaking...' : ttsEnabled ? 'TTS On' : 'TTS Off'}
          </span>
        </button>
      </div>

      <div className="absolute top-4 right-4" title="Audio output optimized for Shokz OpenRun Pro 2 bone-conduction headset">
        <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/40">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 16v-2a10 10 0 0 1 20 0v2"/><path d="M2 16h4v4H2z"/><path d="M18 16h4v4h-4z"/><path d="M8 12h8"/></svg>
          Bone conduction
        </div>
      </div>
    </div>
  );
}
