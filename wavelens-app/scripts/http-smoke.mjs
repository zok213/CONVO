import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const port = Number(process.env.SMOKE_PORT ?? 3101);
const baseUrl = `http://127.0.0.1:${port}`;
const nextBin = join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
const results = [];

function expect(name, condition, detail = '') {
  results.push({ ok: Boolean(condition), name, detail: condition ? '' : detail });
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer() {
  const started = Date.now();
  while (Date.now() - started < 30000) {
    try {
      const response = await fetch(`${baseUrl}/demo`);
      if (response.ok) return;
    } catch {
      // Server not ready yet.
    }
    await sleep(500);
  }
  throw new Error('server did not become ready within 30 seconds');
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { response, body, text };
}

async function main() {
  if (!existsSync(join(root, '.next'))) {
    throw new Error('missing .next build output; run npm run build first');
  }

  const server = spawn(process.execPath, [nextBin, 'start', '--port', String(port)], {
    cwd: root,
    env: {
      ...process.env,
      NEXT_PUBLIC_AGORA_APP_ID: '00000000000000000000000000000000',
      NEXT_AGORA_APP_CERTIFICATE: '11111111111111111111111111111111',
      AGORA_CUSTOMER_ID: '',
      AGORA_CUSTOMER_SECRET: '',
      SOLANA_PRIVATE_KEY: '',
      PORT: String(port),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let output = '';
  server.stdout.on('data', (chunk) => { output += chunk.toString(); });
  server.stderr.on('data', (chunk) => { output += chunk.toString(); });

  try {
    await waitForServer();

    const home = await request('/');
    expect('GET / renders', home.response.status === 200, `status ${home.response.status}`);
    expect('GET / contains WaveLens', home.text.includes('WaveLens'), 'missing product marker');

    const demo = await request('/demo');
    expect('GET /demo renders', demo.response.status === 200, `status ${demo.response.status}`);
    expect('GET /demo contains app marker', /WaveLens|__next/.test(demo.text), 'missing app marker');

    const session = await request('/api/session/start', { method: 'POST' });
    expect('session/start success status', session.response.status === 200, `status ${session.response.status}`);
    expect('session/start response shape', (typeof session.body?.token === 'string' || session.body?.token === null)
      && session.body?.token !== ''
      && /^wavelens-/.test(session.body?.channel ?? '')
      && /^\d+$/.test(session.body?.uid ?? '')
      && /^session_/.test(session.body?.sessionId ?? '')
      && typeof session.body?.appId === 'string'
      && session.body.appId.length > 0, JSON.stringify(session.body));

    const agentMissing = await request('/api/session/agent/start', { method: 'POST', body: JSON.stringify({}) });
    expect('agent/start missing channel -> 400', agentMissing.response.status === 400, `status ${agentMissing.response.status}`);

    const agentMissingUid = await request('/api/session/agent/start', {
      method: 'POST',
      body: JSON.stringify({ channel: 'edge-channel' }),
    });
    expect('agent/start missing uid -> 400', agentMissingUid.response.status === 400, `status ${agentMissingUid.response.status}`);

    const agentBadDomain = await request('/api/session/agent/start', {
      method: 'POST',
      body: JSON.stringify({ channel: 'edge-channel', uid: '12345', domain: 'invalid' }),
    });
    expect('agent/start invalid domain -> 400', agentBadDomain.response.status === 400, `status ${agentBadDomain.response.status}`);

    const rttMissingSession = await request('/api/session/rtt/start', { method: 'POST', body: JSON.stringify({}) });
    expect('rtt/start missing session -> 400', rttMissingSession.response.status === 400, `status ${rttMissingSession.response.status}`);

    const rttMissingChannel = await request('/api/session/rtt/start', {
      method: 'POST',
      body: JSON.stringify({ sessionId: 'session_test' }),
    });
    expect('rtt/start missing channel -> 400', rttMissingChannel.response.status === 400, `status ${rttMissingChannel.response.status}`);

    const rttStandby = await request('/api/session/rtt/start', {
      method: 'POST',
      body: JSON.stringify({ sessionId: 'session_test', channel: 'edge-channel', langSrc: 'vi-VN', langTgt: 'en-US' }),
    });
    expect('rtt/start no creds -> 501 standby', rttStandby.response.status === 501 && rttStandby.body?.state === 'STANDBY', JSON.stringify(rttStandby.body));

    const endMissing = await request('/api/session/end', { method: 'POST', body: JSON.stringify({}) });
    expect('session/end missing session -> 400', endMissing.response.status === 400, `status ${endMissing.response.status}`);

    const endNoIds = await request('/api/session/end', {
      method: 'POST',
      body: JSON.stringify({ sessionId: 'session_test' }),
    });
    expect('session/end no ids -> 200', endNoIds.response.status === 200
      && endNoIds.body?.agent === 'not-provided'
      && endNoIds.body?.rtt === 'not-provided', JSON.stringify(endNoIds.body));

    const auditMissing = await request('/api/audit/hash', { method: 'POST', body: JSON.stringify({}) });
    expect('audit/hash missing text -> 400', auditMissing.response.status === 400, `status ${auditMissing.response.status}`);

    const auditValid = await request('/api/audit/hash', {
      method: 'POST',
      body: JSON.stringify({ viText: 'xin chao', enText: 'hello', sessionId: 'session_test' }),
    });
    expect('audit/hash valid -> hash shape', auditValid.response.status === 200
      && /^[0-9a-f]{64}$/.test(auditValid.body?.hash ?? '')
      && /^demo_/.test(auditValid.body?.txSignature ?? ''), JSON.stringify(auditValid.body));

    const solanaBadHash = await request('/api/solana/record', {
      method: 'POST',
      body: JSON.stringify({ hash: 'not-a-hash' }),
    });
    expect('solana/record invalid hash -> 400', solanaBadHash.response.status === 400, `status ${solanaBadHash.response.status}`);

    const solanaVerifyMissing = await request('/api/solana/verify');
    expect('solana/verify missing assetId -> 400', solanaVerifyMissing.response.status === 400, `status ${solanaVerifyMissing.response.status}`);

    const logMissing = await request('/api/log-session', { method: 'POST', body: JSON.stringify({}) });
    expect('log-session missing fields -> 400', logMissing.response.status === 400, `status ${logMissing.response.status}`);

    const logValid = await request('/api/log-session', {
      method: 'POST',
      body: JSON.stringify({ channelName: 'edge-channel', timestamp: new Date().toISOString() }),
    });
    expect('log-session valid -> 200', logValid.response.status === 200 && logValid.body?.success === true, JSON.stringify(logValid.body));

    const chatEmptyMessages = await request('/api/chat/completions', { method: 'POST', body: JSON.stringify({}) });
    expect('chat/completions empty messages -> 400', chatEmptyMessages.response.status === 400, `status ${chatEmptyMessages.response.status}`);

    const sttMissingConfig = await request('/api/stt-translation', { method: 'POST', body: JSON.stringify({}) });
    expect('stt-translation missing config -> 500', sttMissingConfig.response.status === 500, `status ${sttMissingConfig.response.status}`);
  } finally {
    server.kill('SIGTERM');
    await sleep(500);
    if (!server.killed) server.kill('SIGKILL');
  }

  for (const result of results) {
    const prefix = result.ok ? 'OK ' : 'ERR';
    console.log(`${prefix} ${result.name}${result.detail ? ` - ${result.detail}` : ''}`);
  }

  if (results.some((result) => !result.ok)) {
    console.error(output);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
