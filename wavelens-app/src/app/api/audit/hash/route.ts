import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { viText, enText, sessionId } = await request.json();
    if (!viText && !enText) return NextResponse.json({ error: 'viText or enText required' }, { status: 400 });

    const data = JSON.stringify({ vi: viText, en: enText, sessionId, ts: Date.now() });
    const encoder = new TextEncoder();
    const hashBuf = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    const hash = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, '0')).join('');

    return NextResponse.json({ hash, txSignature: `demo_${hash.slice(0, 8)}` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
