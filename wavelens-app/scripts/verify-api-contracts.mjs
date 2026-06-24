import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const results = [];

function read(relativePath) {
  const path = join(root, relativePath);
  if (!existsSync(path)) {
    results.push({ ok: false, name: relativePath, detail: 'missing file' });
    return '';
  }
  return readFileSync(path, 'utf8');
}

function expect(name, condition, detail = '') {
  results.push({ ok: Boolean(condition), name, detail: condition ? '' : detail });
}

function hasAll(text, values) {
  return values.every((value) => text.includes(value));
}

const sessionStart = read('src/app/api/session/start/route.ts');
expect('session/start requires Agora env', hasAll(sessionStart, [
  'NEXT_PUBLIC_AGORA_APP_ID',
  'NEXT_AGORA_APP_CERTIFICATE',
]), 'missing required env checks');
expect('session/start returns canonical shape', hasAll(sessionStart, [
  'token',
  'channel',
  'uid',
  'appId',
  'sessionId',
]), 'expected token/channel/uid/appId/sessionId response');

const agentStart = read('src/app/api/session/agent/start/route.ts');
expect('session/agent/start accepts language context', hasAll(agentStart, [
  'langSrc',
  'langTgt',
  'domain',
]), 'missing domain/langSrc/langTgt');
expect('session/agent/start returns camel-case agentId', agentStart.includes('agentId'), 'response must include agentId');
expect('session/agent/start configures managed pipeline', hasAll(agentStart, [
  'DeepgramSTT',
  'OpenAI',
  'MiniMaxTTS',
]), 'missing STT/LLM/TTS configuration');

const rttStart = read('src/app/api/session/rtt/start/route.ts');
expect('session/rtt/start supports REST join', hasAll(rttStart, [
  'https://api.agora.io/api/speech-to-text/v1/projects',
  '/join',
  'AGORA_CUSTOMER_ID',
  'AGORA_CUSTOMER_SECRET',
  'rttAgentId',
]), 'missing Agora STT REST join contract');
expect('session/rtt/start standby is explicit 501', rttStart.includes('status: 501'), 'missing optional-credential standby response');

const sessionEnd = read('src/app/api/session/end/route.ts');
expect('session/end accepts cleanup ids', hasAll(sessionEnd, [
  'agentId',
  'rttAgentId',
  'sessionId',
]), 'missing cleanup identifiers');
expect('session/end stops agent and RTT idempotently', hasAll(sessionEnd, [
  'stopAgent',
  '/leave',
  'already-stopping',
]), 'missing stop behavior');

const liveSession = read('src/components/LiveSession.tsx');
expect('LiveSession passes language context', hasAll(liveSession, [
  'langSrc',
  'langTgt',
  '/api/session/agent/start',
  '/api/session/rtt/start',
]), 'missing backend language context');
expect('LiveSession keeps CONNECTED publish guard', liveSession.includes("connectionState !== 'CONNECTED'"), 'missing publish guard');
expect('LiveSession handles protobuf decoder', liveSession.includes('decodeSttMessage'), 'missing protobuf stream parsing');
expect('LiveSession does not mark Solana from demo hash only', !liveSession.includes('hashConfirmed: true } : t'), 'legacy demo hash confirmation still present');

const solanaRecord = read('src/app/api/solana/record/route.ts');
expect('solana/record returns assetId explorer shape', hasAll(solanaRecord, [
  'assetId',
  'solanaExplorerUrl',
]), 'missing Metaplex Core receipt response');

const solanaVerify = read('src/app/api/solana/verify/route.ts');
expect('solana/verify accepts assetId or tx alias', hasAll(solanaVerify, [
  'assetId',
  "searchParams.get('tx')",
]), 'missing assetId/tx query support');

const solanaConnection = read('src/lib/solana-connection.ts');
expect('Solana attributes store message count', solanaConnection.includes('message_count'), 'missing message_count attribute');
expect('Solana code has no fake backend.test URI', !solanaConnection.includes('backend.test'), 'fake backend URI remains');

const docs = [
  '../README.md',
  'docs/RECIPE.md',
  'docs/L1/02_architecture.md',
  'docs/L1/03_code_map.md',
  'docs/L1/05_workflows.md',
  'docs/L1/06_interfaces.md',
  'docs/L1/07_gotchas.md',
].map(read).join('\n');
expect('primary docs avoid missing legacy component claims', !/(LandingPage|ConversationComponent|DemoTranslatorSession|Memo program|Memo Program)/.test(docs), 'stale legacy docs remain');

for (const result of results) {
  const prefix = result.ok ? 'OK ' : 'ERR';
  console.log(`${prefix} ${result.name}${result.detail ? ` - ${result.detail}` : ''}`);
}

if (results.some((result) => !result.ok)) {
  process.exit(1);
}
