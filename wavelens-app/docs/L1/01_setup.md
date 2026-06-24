# 01 Setup

## Local Run

```bash
cd wavelens-app
npm install
cp .env.local.example .env.local
npm run doctor
npm run dev
```

Open `http://localhost:3001/demo`.

## Required Env

- `NEXT_PUBLIC_AGORA_APP_ID`
- `NEXT_AGORA_APP_CERTIFICATE`

## Optional Env

- `AGORA_CUSTOMER_ID` and `AGORA_CUSTOMER_SECRET`: enable Agora real-time STT translation.
- `SOLANA_PRIVATE_KEY`: JSON byte array for a Solana devnet signer.
- `SESSION_WEBHOOK_URL`: session telemetry webhook.
- `NEXT_LLM_API_KEY` and `NEXT_LLM_URL`: optional OpenAI-compatible proxy.

## Verification

```bash
npm run doctor
npm run lint
npm run typecheck
npm run verify:api
npm run build
```

`npm run verify` runs the full chain.

## External Acceptance

- Agora project must have App Certificate enabled.
- Agora CAI/STT billing and permissions must be enabled in Console.
- Solana signer must have devnet SOL before Safety Pass minting can succeed.
- Target phone/headset setup must be rehearsed manually.
