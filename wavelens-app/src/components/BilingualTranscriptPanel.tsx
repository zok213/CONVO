'use client';

import { useEffect, useRef } from 'react';

export interface TranscriptEntry {
  id: string;
  sourceText: string;
  translatedText: string;
  timestamp: number;
  isFinal: boolean;
  speaker: 'user' | 'agent';
}

interface BilingualTranscriptPanelProps {
  entries: TranscriptEntry[];
  sourceLanguage: string;
  targetLanguage: string;
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour12: false });
}

function langCode(locale: string): string {
  return locale.split('-')[0]?.toUpperCase() ?? locale;
}

export function BilingualTranscriptPanel({
  entries,
  sourceLanguage,
  targetLanguage,
}: BilingualTranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  return (
    <div className="h-full overflow-y-auto text-sm text-white">
      {entries.length === 0 ? (
        <div className="flex h-full items-center justify-center text-white/30">
          Waiting for speech...
        </div>
      ) : (
        <>
          {entries.map((entry) => (
            <div key={entry.id} className="border-b border-white/10 px-4 py-2">
              <div className="mb-0.5 text-[10px] text-white/40">
                {formatTimestamp(entry.timestamp)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="min-w-0">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                    {langCode(sourceLanguage)}
                  </span>
                  <p className="mt-0.5 truncate">
                    {entry.sourceText}
                    {!entry.isFinal && (
                      <span className="ml-0.5 animate-pulse text-white/60">|</span>
                    )}
                  </p>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">
                    {langCode(targetLanguage)}
                  </span>
                  <p className="mt-0.5 truncate">
                    {entry.translatedText || (
                      <span className="italic text-white/30">Translating...</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </>
      )}
    </div>
  );
}
