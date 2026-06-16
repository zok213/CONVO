import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { channelName, timestamp, domain, messageCount, transcriptSummary, deviceInfo } = body;

    if (!channelName || !timestamp) {
      return NextResponse.json(
        { error: 'channelName and timestamp are required' },
        { status: 400 },
      );
    }

    const sessionId = Math.random().toString(36).substring(2, 8);

    const logData = { sessionId, channelName, timestamp, domain, messageCount, transcriptSummary, deviceInfo };
    console.log('[WAVELENS_SESSION]', JSON.stringify(logData));

    if (process.env.SESSION_WEBHOOK_URL) {
      fetch(process.env.SESSION_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, sessionId });
  } catch (error) {
    console.error('[WAVELENS_SESSION] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
