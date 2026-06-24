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

    const systemPrompt = domain === 'maritime'
      ? 'You are a strict Maritime Vietnamese-English interpreter. If you hear Vietnamese, output ONLY the English translation. If you hear English, output ONLY the Vietnamese translation. NEVER ask the user questions. NEVER say "Please provide information". If you do not hear clearly, remain silent.'
      : 'You are a strict Vietnamese-English translator. Output ONLY the translation. Do not add filler. Do not ask the user questions. If speech is unclear, remain silent.';

    const greetingText = domain === 'maritime' ? 'Sẵn sàng dịch thuật hàng hải.' : 'Ready for voice translation.';

    const agent = new Agent({
      name: `wavelens-agent-${Date.now()}`,
      turnDetection: {
        language: 'vi-VN',
        config: {
          speech_threshold: 0.5,
          start_of_speech: { mode: 'vad', vad_config: { interrupt_duration_ms: 160, prefix_padding_ms: 300 } },
          end_of_speech: { mode: 'vad', vad_config: { silence_duration_ms: 480 } },
        },
      },
      advancedFeatures: { enable_rtm: true, enable_tools: false },
      parameters: { enable_error_message: true },
    })
      .withStt(new DeepgramSTT({ model: 'nova-3', language: 'vi' }))
      .withLlm(new OpenAI({
        model: 'gpt-4o-mini',
        systemMessages: [{ role: 'system', content: systemPrompt }],
        greetingMessage: greetingText,
        failureMessage: 'Xin lỗi, tôi đang xử lý lỗi.',
        params: { max_tokens: 1024, temperature: 0.3 },
      }))
      .withTts(new MiniMaxTTS({ model: 'speech_2_6_turbo', voiceId: 'English_captivating_female1' }));

    const session = agent.createSession(client, {
      channel,
      agentUid: "0",
      remoteUids: uid ? [uid] : [],
      idleTimeout: 300,
      expiresIn: ExpiresIn.hours(1),
    });
    const agentId = await session.start();

    return NextResponse.json({ agent_id: agentId, state: 'RUNNING' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
