'use client';

import { useState } from 'react';
import type { SolanaReceiptData } from '@/lib/solana-utils';

interface SolanaReceiptProps {
  receiptData: SolanaReceiptData;
  solanaTxId?: string;
}

export default function SolanaReceipt({ receiptData, solanaTxId }: SolanaReceiptProps) {
  const [copied, setCopied] = useState(false);

  const truncateHash = (hash: string) =>
    `${hash.slice(0, 8)}...${hash.slice(-4)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(receiptData.hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/80">
          Solana Receipt
        </h3>
        <div className="flex items-center gap-1 text-[10px] text-neutral-400">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
          SHA-256
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-neutral-400">Hash</span>
          <div className="flex items-center gap-2">
            <code className="text-green-400 font-mono text-[11px]">
              {truncateHash(receiptData.hash)}
            </code>
            <button
              onClick={handleCopy}
              className="text-neutral-500 hover:text-white transition-colors"
              title="Copy hash"
            >
              {copied ? (
                <span className="text-green-400 text-[10px]">Copied!</span>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-neutral-400">Timestamp</span>
          <span className="text-white/70">
            {new Date(receiptData.timestamp).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-neutral-400">Channel</span>
          <span className="text-white/70">{receiptData.channelName}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-neutral-400">Messages</span>
          <span className="text-white/70">{receiptData.messageCount}</span>
        </div>
      </div>

      {solanaTxId && (
        <a
          href={`https://explorer.solana.com/tx/${solanaTxId}?cluster=devnet`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors pt-2 border-t border-neutral-700"
        >
          Verify on Solana devnet
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      )}
    </div>
  );
}
