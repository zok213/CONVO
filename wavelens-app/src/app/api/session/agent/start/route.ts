import { NextRequest, NextResponse } from 'next/server';
import { AgoraClient, Agent, Area, DeepgramSTT, ExpiresIn, MiniMaxTTS, OpenAI } from 'agora-agents';

type Domain = 'maritime' | 'coaching';

type AgentStartBody = {
  channel?: string;
  uid?: string;
  domain?: Domain;
  langSrc?: string;
  langTgt?: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function sttLanguage(locale: string): string {
  const [language] = locale.split('-');
  return language || 'vi';
}

function targetLanguageName(locale: string): string {
  const names: Record<string, string> = {
    'en': 'English',
    'vi': 'Vietnamese',
    'zh': 'Chinese',
    'ko': 'Korean',
    'ja': 'Japanese',
  };
  return names[sttLanguage(locale)] ?? locale;
}

function systemPrompt(domain: Domain, langSrc: string, langTgt: string): string {
  const target = targetLanguageName(langTgt);
  if (domain === 'maritime') {
    return [
      'You are a strict maritime industrial interpreter.',
      `Translate speech from ${langSrc} into ${target}.`,
      'Output only the translation. Do not explain, ask questions, or add filler.',
      'Use correct maritime terminology for port, vessel, engine room, deck, cargo, and safety commands.',
      'Critical glossary: ket ballast = ballast tank; bom bi-lo = bilge pump; nguoi roi xuong bien = man overboard; tram tap hop = muster station; can cau cong = gantry crane; may chinh = main engine; bom cuu hoa = fire pump; cau tau = pier or dock.',
      'If speech is unclear, stay silent.',
    ].join(' ');
  }

  return [
    'You are a strict voice translator.',
    `Translate speech from ${langSrc} into ${target}.`,
    'Output only the translation. Do not explain, ask questions, or add filler.',
    'If speech is unclear, stay silent.',
  ].join(' ');
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AgentStartBody;
    const { channel, uid, domain = 'maritime', langSrc = 'vi-VN', langTgt = 'en-US' } = body;

    if (!channel) return NextResponse.json({ error: 'channel required' }, { status: 400 });
    if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 });
    if (!['maritime', 'coaching'].includes(domain)) {
      return NextResponse.json({ error: 'domain must be maritime or coaching' }, { status: 400 });
    }

    const appId = requireEnv('NEXT_PUBLIC_AGORA_APP_ID');
    const cert = requireEnv('NEXT_AGORA_APP_CERTIFICATE');
    const client = new AgoraClient({ area: Area.US, appId, appCertificate: cert });

    const prompt = systemPrompt(domain, langSrc, langTgt);
    const greetingText = domain === 'maritime'
      ? 'Ready for maritime translation.'
      : 'Ready for voice translation.';

    const agent = new Agent({
      client,
      instructions: prompt,
      greeting: greetingText,
      failureMessage: 'Please wait a moment.',
      maxHistory: 20,
      turnDetection: {
        language: langSrc as any,
        config: {
          speech_threshold: 0.5,
          start_of_speech: { mode: 'vad', vad_config: { interrupt_duration_ms: 160, prefix_padding_ms: 300 } },
          end_of_speech: { mode: 'vad', vad_config: { silence_duration_ms: 480 } },
        },
      },
      advancedFeatures: { enable_tools: false },
      parameters: {
        data_channel: 'datastream',
        audio_scenario: 'aiserver',
      },
    })
      .withStt(new DeepgramSTT({ model: 'nova-3', language: sttLanguage(langSrc) as any }))
      .withLlm(new OpenAI({
        model: domain === 'maritime' ? 'gpt-4o-mini' : 'gpt-4o-mini',
        systemMessages: [{ role: 'system', content: prompt }],
        greetingMessage: greetingText,
        failureMessage: 'Please wait a moment.',
        params: { max_tokens: 512, temperature: 0.2 },
      }))
      .withTts(new MiniMaxTTS({ model: 'speech_2_6_turbo', voiceId: 'English_captivating_female1' }));

    const session = agent.createSession(client, {
      name: `wavelens-agent-${Date.now()}`,
      channel,
      agentUid: '0',
      remoteUids: [uid],
      idleTimeout: 300,
      expiresIn: ExpiresIn.hours(1),
    });

    const rawStartResult = await session.start();
    const agentId = typeof rawStartResult === 'string'
      ? rawStartResult
      : (rawStartResult as { agentId?: string; agent_id?: string }).agentId
        ?? (rawStartResult as { agentId?: string; agent_id?: string }).agent_id;

    if (!agentId) throw new Error('Agent start succeeded without agent id');

    return NextResponse.json({ agentId, agent_id: agentId, state: 'RUNNING' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
