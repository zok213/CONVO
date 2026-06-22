import { NextRequest, NextResponse } from 'next/server';
import { verifyReceipt } from '@/lib/solana-connection';

export async function GET(request: NextRequest) {
  try {
    const assetId = request.nextUrl.searchParams.get('assetId') || request.nextUrl.searchParams.get('tx');
    if (!assetId) {
      return NextResponse.json(
        { error: 'assetId query parameter required' },
        { status: 400 },
      );
    }

    const receipt = await verifyReceipt(assetId);
    if (!receipt) {
      return NextResponse.json(
        { error: 'Receipt not found or invalid', assetId },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      receipt,
      assetId,
    });
  } catch (error) {
    console.error('[Solana Verify] Error:', error);
    return NextResponse.json(
      { error: 'Failed to verify receipt' },
      { status: 500 },
    );
  }
}
