import { NextRequest, NextResponse } from 'next/server';
import { verifyReceipt } from '@/lib/solana-connection';

export async function GET(request: NextRequest) {
  try {
    const txSignature = request.nextUrl.searchParams.get('tx');
    if (!txSignature) {
      return NextResponse.json(
        { error: 'tx query parameter required' },
        { status: 400 },
      );
    }

    const receipt = await verifyReceipt(txSignature);
    if (!receipt) {
      return NextResponse.json(
        { error: 'Receipt not found or invalid', txSignature },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      receipt,
      txSignature,
    });
  } catch (error) {
    console.error('[Solana Verify] Error:', error);
    return NextResponse.json(
      { error: 'Failed to verify receipt' },
      { status: 500 },
    );
  }
}
