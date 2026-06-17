'use client';

import { useEffect, useState } from 'react';

export interface SessionSummaryProps {
  channelName: string;
  domain: string;
  duration: number;
  messageCount: number;
  hash: string;
  sessionId?: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function SessionSummary({
  channelName,
  domain,
  duration,
  messageCount,
  hash,
  sessionId,
}: SessionSummaryProps) {
  const [copied, setCopied] = useState(false);

  const shareText =
    `WaveLens Session Summary\n` +
    `Session ID: ${sessionId ?? 'N/A'}\n` +
    `Channel: ${channelName}\n` +
    `Domain: ${domain}\n` +
    `Duration: ${formatDuration(duration)}\n` +
    `Messages: ${messageCount}\n` +
    `Hash: ${hash}`;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
    } catch {
      // Clipboard not available
    }
  };

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  return (
    <div className="mx-auto w-full max-w-md rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h2 className="mb-4 text-center text-lg font-semibold text-white">Session Ended</h2>

      <div className="space-y-3 text-sm">
        {sessionId && (
          <div className="flex items-center justify-between">
            <span className="text-white/50">Session ID</span>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-xs text-white/80">
              {sessionId}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-white/50">Duration</span>
          <span className="text-white">{formatDuration(duration)}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-white/50">Messages Translated</span>
          <span className="text-white">{messageCount}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-white/50">Domain</span>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/80">
            {domain}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-white/50">Channel</span>
          <span className="font-mono text-xs text-white/70">{channelName}</span>
        </div>

        <div className="pt-2">
          <div className="mb-1 text-xs text-white/40">SHA-256 ” Audit Hash</div>
          <div className="break-all font-mono text-[10px] text-white/50 leading-relaxed">{hash}</div>
        </div>

        <a
          href={`https://explorer.solana.com/tx/${hash}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/5 py-2 text-xs text-blue-400 transition-colors hover:bg-blue-500/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Verify on Solana Devnet
        </a>
      </div>

      <button
        onClick={handleShare}
        className="mt-5 w-full rounded-lg bg-white/10 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
      >
        {copied ? 'Copied!' : 'Share Session'}
      </button>
    </div>
  );
}
