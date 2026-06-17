import { NextRequest, NextResponse } from 'next/server';

const STT_BASE_URL = 'https://api.agora.io/api/speech-to-text/v1/projects';

export async function POST(request: NextRequest) {
  const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const CUSTOMER_ID = process.env.AGORA_CUSTOMER_ID;
  const CUSTOMER_SECRET = process.env.AGORA_CUSTOMER_SECRET;

  if (!APP_ID || !CUSTOMER_ID || !CUSTOMER_SECRET) {
    return NextResponse.json(
      {
        error: 'Missing Agora credentials',
        hint: 'Set NEXT_PUBLIC_AGORA_APP_ID, AGORA_CUSTOMER_ID, AGORA_CUSTOMER_SECRET',
      },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const {
      channelName,
      languages = ['en-US'],
      sourceLanguage = 'en-US',
      targetLanguages = ['vi-VN'],
      subBotUid,
      pubBotUid,
    } = body;

    if (!channelName) {
      return NextResponse.json({ error: 'channelName is required' }, { status: 400 });
    }

    const agentName = 'stt-agent-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

    const rtcConfig = {
      channelName,
      subBotUid: subBotUid ?? String(Math.floor(Math.random() * 100000) + 10000),
      pubBotUid: pubBotUid ?? String(Math.floor(Math.random() * 100000) + 10000),
    };

    const sttPayload: Record<string, unknown> = {
      name: agentName,
      languages,
      maxIdleTime: 300,
      rtcConfig,
    };

    if (targetLanguages.length > 0) {
      sttPayload.translateConfig = {
        languages: [
          {
            source: sourceLanguage,
            target: targetLanguages,
          },
        ],
      };
    }

    const basicAuth = Buffer.from(CUSTOMER_ID + ':' + CUSTOMER_SECRET).toString('base64');

    const response = await fetch(STT_BASE_URL + '/' + APP_ID + '/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + basicAuth,
      },
      body: JSON.stringify(sttPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: 'STT API request failed', detail: data },
        { status: response.status },
      );
    }

    return NextResponse.json({
      agentId: data.agent_id,
      subBotUid: rtcConfig.subBotUid,
      pubBotUid: rtcConfig.pubBotUid,
      agentName,
    });
  } catch (error) {
    console.error('[STT-API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', detail: String(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const CUSTOMER_ID = process.env.AGORA_CUSTOMER_ID;
  const CUSTOMER_SECRET = process.env.AGORA_CUSTOMER_SECRET;

  if (!APP_ID || !CUSTOMER_ID || !CUSTOMER_SECRET) {
    return NextResponse.json({ error: 'Missing Agora credentials' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { agentId } = body;

    if (!agentId) {
      return NextResponse.json({ error: 'agentId is required' }, { status: 400 });
    }

    const basicAuth = Buffer.from(CUSTOMER_ID + ':' + CUSTOMER_SECRET).toString('base64');

    const response = await fetch(STT_BASE_URL + '/' + APP_ID + '/agents/' + agentId + '/leave', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + basicAuth,
      },
    });

    const data = await response.json();
    return NextResponse.json({ stopped: true, detail: data });
  } catch (error) {
    console.error('[STT-API] Stop error:', error);
    return NextResponse.json(
      { error: 'Failed to stop STT agent', detail: String(error) },
      { status: 500 },
    );
  }
}
