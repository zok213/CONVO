# 05 Workflows

## Change Demo Runtime

1. Update `LiveSession` or `/api/session/*`.
2. Add or update `scripts/verify-api-contracts.mjs` expectations first.
3. Run `npm run verify:api`.
4. Run `npm run typecheck` and `npm run lint`.

## Change Agent Behavior

Edit `src/app/api/session/agent/start/route.ts`.

Keep:

- Domain and language fields accepted from the client.
- Server-side env validation.
- STT/LLM/TTS provider chain.
- `agentId` in the response.

## Change RTT Translation

Edit `src/app/api/session/rtt/start/route.ts`.

Keep missing `AGORA_CUSTOMER_ID/SECRET` as standby `501`, because RTT is optional for demo boot.

## Change Solana Receipt

Edit `src/lib/solana-connection.ts` and `/api/solana/*`.

Keep:

- Valid SHA-256 input check.
- Metaplex Core `assetId` response.
- `message_count` attribute.
- Graceful UI failure when devnet wallet is unfunded.

## Ship Check

```bash
npm run verify
```

Then manually test `/demo` with live credentials, target hardware, and funded devnet signer.
