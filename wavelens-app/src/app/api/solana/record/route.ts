import { NextRequest, NextResponse } from 'next/server';
import { recordReceipt } from '@/lib/solana-connection';
import type { SolanaReceiptData } from '@/lib/solana-utils';
import { isValidHash } from '@/lib/solana-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hash, timestamp, channelName, domain, messageCount } = body;

    if (!hash || !isValidHash(hash)) {
      return NextResponse.json(
        { error: 'Valid SHA-256 hash required' },
        { status: 400 },
      );
    }

    const receiptData: SolanaReceiptData = {
      hash,
      timestamp: timestamp ?? Date.now(),
      channelName: channelName ?? '',
      domain: domain ?? '',
      messageCount: messageCount ?? 0,
    };

    const assetId = await recordReceipt(receiptData);

    return NextResponse.json({
      success: true,
      assetId,
      solanaExplorerUrl: `https://explorer.solana.com/address/${assetId}?cluster=devnet`,
    });
  } catch (error) {
    console.error('[Solana Record] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to record receipt' },
      { status: 500 },
    );
  }
}
