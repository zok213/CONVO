import { NextRequest, NextResponse } from 'next/server';

const STT_BASE_URL = 'https://api.agora.io/api/speech-to-text/v1/projects';

type RttStartBody = {
  sessionId?: string;
  channel?: string;
  uid?: string;
  langSrc?: string;
  langTgt?: string;
};

function basicAuth(customerId: string, customerSecret: string): string {
  return Buffer.from(`${customerId}:${customerSecret}`).toString('base64');
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, channel, uid, langSrc = 'vi-VN', langTgt = 'en-US' } = (await request.json()) as RttStartBody;
    if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    if (!channel) return NextResponse.json({ error: 'channel required' }, { status: 400 });

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const customerId = process.env.AGORA_CUSTOMER_ID;
    const customerSecret = process.env.AGORA_CUSTOMER_SECRET;

    if (!appId || !customerId || !customerSecret) {
      return NextResponse.json(
        { error: 'RTT requires AGORA_CUSTOMER_ID and AGORA_CUSTOMER_SECRET', state: 'STANDBY' },
        { status: 501 },
      );
    }

    const subBotUid = String(Math.floor(Math.random() * 90000) + 10000);
    const pubBotUid = String(Math.floor(Math.random() * 90000) + 10000);
    const response = await fetch(`${STT_BASE_URL}/${appId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${basicAuth(customerId, customerSecret)}`,
      },
      body: JSON.stringify({
        name: `wavelens-rtt-${Date.now()}`,
        languages: [langSrc],
        maxIdleTime: 300,
        rtcConfig: {
          channelName: channel,
          subBotUid,
          pubBotUid,
          subscribeAudioUids: uid ? [uid] : ['all'],
        },
        translateConfig: {
          languages: [{ source: langSrc, target: [langTgt] }],
        },
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { error: 'RTT API request failed', detail: data },
        { status: response.status },
      );
    }

    const rttAgentId = data.agent_id ?? data.agentId;
    return NextResponse.json({
      rttAgentId,
      agentId: rttAgentId,
      state: 'RUNNING',
      sessionId,
      subBotUid,
      pubBotUid,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
