import { NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-token';

const EXPIRATION = 3600;
let sidCounter = 0;

export async function POST() {
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const cert = process.env.NEXT_AGORA_APP_CERTIFICATE;
  if (!appId || !cert) {
    return NextResponse.json({ error: 'Agora credentials not set' }, { status: 500 });
  }

  sidCounter++;
  const channel = `wavelens-${Date.now()}-${sidCounter}`;
  const uid = String(Math.floor(Math.random() * 90000) + 10000);
  const expiresAt = Math.floor(Date.now() / 1000) + EXPIRATION;
  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    cert,
    channel,
    parseInt(uid, 10),
    RtcRole.PUBLISHER,
    expiresAt,
    expiresAt,
  );

  return NextResponse.json({
    token, channel, uid, appId,
    sessionId: `session_${Date.now()}_${sidCounter}`,
  });
}
