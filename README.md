# WaveLens Lite

Real-time multilingual voice translation for industrial crews, built as a Next.js demo around Agora Conversational AI, Agora real-time STT translation, and Solana Metaplex Core audit receipts.

## Current Source Of Truth

- App: `wavelens-app`
- Demo route: `http://localhost:3001/demo`
- Main runtime path: `/demo` -> `LiveSession` -> `/api/session/*`
- Blockchain receipt model: Metaplex Core Safety Pass asset, returned as `assetId`
- Legacy quickstart routes remain for compatibility only; they are not the primary demo flow.

## Setup

```bash
cd wavelens-app
npm install
cp .env.local.example .env.local
npm run doctor
npm run dev
```

Required env:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_AGORA_APP_ID` | Agora project App ID |
| `NEXT_AGORA_APP_CERTIFICATE` | Agora App Certificate, server-side only |

Optional env:

| Variable | Description |
| --- | --- |
| `AGORA_CUSTOMER_ID` / `AGORA_CUSTOMER_SECRET` | Enables Agora real-time STT translation route |
| `SOLANA_PRIVATE_KEY` | Solana devnet signer as JSON byte array |
| `SESSION_WEBHOOK_URL` | Receives session telemetry |
| `NEXT_LLM_API_KEY` / `NEXT_LLM_URL` | Enables optional OpenAI-compatible proxy route |

## Commands

```bash
npm run dev          # Next dev server on port 3001
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm run doctor       # Local setup and secret hygiene checks
npm run verify:api   # Source-level API contract checks
npm run verify       # doctor + lint + typecheck + verify:api + build
```

## Canonical API Surface

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/session/start` | POST | Returns `{ appId, token, channel, uid, sessionId }` |
| `/api/session/agent/start` | POST | Starts Agora CAI agent with domain and language context |
| `/api/session/rtt/start` | POST | Starts Agora STT translation when REST credentials are set; otherwise returns standby `501` |
| `/api/session/end` | POST | Idempotently stops agent/RTT and ends the local session |
| `/api/solana/record` | POST | Records a SHA-256 audit hash as a Metaplex Core Safety Pass |
| `/api/solana/verify` | GET | Verifies `assetId` or `tx` alias and returns receipt attributes |

## Demo MVP Status

Code-complete means local source and contracts are wired. These still require external validation:

- Live Agora credentials and billing enabled in Agora Console.
- Optional Agora STT REST credentials for RTT text stream.
- Funded Solana devnet signer for successful Safety Pass minting.
- Hardware rehearsal with the target phone and headset.
- Deployment environment variables if publishing to Vercel or another host.

Tracked local secret-like files were removed from this repo. Rotate any keys that were previously committed or shared.
