# 04 Conventions

## Runtime

- Treat `/demo`, `LiveSession`, and `/api/session/*` as canonical.
- Keep browser-only Agora SDK usage inside client components.
- Keep privileged Agora and Solana calls inside API routes.
- Keep microphone publish behind the RTC `CONNECTED` guard.

## Data

- Use `agentId` in new code; keep `agent_id` only as compatibility output.
- Use `assetId` for Solana Metaplex Core receipts.
- Use `langSrc` and `langTgt` locale strings across UI and session APIs.

## Verification

- Update `scripts/verify-api-contracts.mjs` before changing API contracts.
- Run `npm run verify:api` for route/interface changes.
- Run `npm run typecheck` for TypeScript changes.
- Update docs in the same change when runtime flow changes.
