import { NextRequest, NextResponse } from 'next/server';
import { AgoraClient, Area } from 'agora-agents';

const STT_BASE_URL = 'https://api.agora.io/api/speech-to-text/v1/projects';

type EndSessionBody = {
  sessionId?: string;
  agentId?: string;
  agent_id?: string;
  rttAgentId?: string;
};

function alreadyStopped(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const maybe = error as { statusCode?: number; body?: { reason?: string; detail?: string }; message?: string };
  const detail = `${maybe.body?.reason ?? ''} ${maybe.body?.detail ?? ''} ${maybe.message ?? ''}`.toLowerCase();
  return maybe.statusCode === 404 || detail.includes('already') || detail.includes('not found');
}

async function stopAgent(agentId: string): Promise<'stopped' | 'already-stopping' | 'failed'> {
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const cert = process.env.NEXT_AGORA_APP_CERTIFICATE;
  if (!appId || !cert) return 'failed';

  try {
    const client = new AgoraClient({ area: Area.US, appId, appCertificate: cert });
    await client.stopAgent(agentId);
    return 'stopped';
  } catch (error) {
    if (alreadyStopped(error)) return 'already-stopping';
    console.error('[session/end] Agent stop failed:', error);
    return 'failed';
  }
}

async function stopRtt(rttAgentId: string): Promise<'stopped' | 'already-stopping' | 'failed'> {
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const customerId = process.env.AGORA_CUSTOMER_ID;
  const customerSecret = process.env.AGORA_CUSTOMER_SECRET;
  if (!appId || !customerId || !customerSecret) return 'already-stopping';

  try {
    const response = await fetch(`${STT_BASE_URL}/${appId}/agents/${rttAgentId}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${customerId}:${customerSecret}`).toString('base64')}`,
      },
    });
    if (response.ok || response.status === 404) return response.status === 404 ? 'already-stopping' : 'stopped';
    console.error('[session/end] RTT stop failed:', await response.text());
    return 'failed';
  } catch (error) {
    console.error('[session/end] RTT stop failed:', error);
    return 'failed';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, agentId, agent_id, rttAgentId } = (await request.json()) as EndSessionBody;
    if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 });

    const resolvedAgentId = agentId ?? agent_id;
    const result = {
      status: 'ended',
      sessionId,
      agent: resolvedAgentId ? await stopAgent(resolvedAgentId) : 'not-provided',
      rtt: rttAgentId ? await stopRtt(rttAgentId) : 'not-provided',
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
