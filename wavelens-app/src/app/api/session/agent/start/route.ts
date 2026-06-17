import { NextRequest, NextResponse } from 'next/server';
import { AgoraClient, Agent, Area, DeepgramSTT, ExpiresIn, MiniMaxTTS, OpenAI } from 'agora-agents';

export async function POST(request: NextRequest) {
  try {
    const { channel, uid, domain = 'maritime' } = await request.json();
    if (!channel) return NextResponse.json({ error: 'channel required' }, { status: 400 });

    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const cert = process.env.NEXT_AGORA_APP_CERTIFICATE;
    if (!appId || !cert) return NextResponse.json({ error: 'Agora credentials not set' }, { status: 500 });

    const client = new AgoraClient({ area: Area.US, appId, appCertificate: cert });

    const agent = new Agent({
      name: `agent_${Date.now().toString(36)}`,
      instructions: domain === 'maritime'
        ? 'You are a Maritime Vietnamese-English interpreter for port operations and ship crews. Translate spoken Vietnamese into accurate English maritime terminology in real time.'
        : 'You are a helpful voice assistant for general conversation. Translate accurately between Vietnamese and English.',
      greeting: domain === 'maritime' ? 'Sẵn sàng dịch thuật hàng hải.' : 'Ready for voice translation.',
    })
      .withLlm(new OpenAI({ model: 'gpt-4o-mini' }))
      .withTts(new MiniMaxTTS({ model: 'speech_2_6_turbo', voiceId: 'English_captivating_female1' }));

    const session = agent.createSession(client, {
      channel,
      agentUid: "0",
      remoteUids: uid ? [uid] : [],
      idleTimeout: 60,
      expiresIn: ExpiresIn.hours(1),
    });
    const agentId = await session.start();

    return NextResponse.json({ agent_id: agentId, state: 'RUNNING' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
