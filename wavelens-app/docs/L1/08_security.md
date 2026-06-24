# 08 Security

## Trust Boundaries

- Browser is untrusted.
- Next.js API routes hold Agora and Solana credentials.
- Agora and Solana are external systems; their live behavior must be verified with real credentials.

## Secret Rules

- Keep `NEXT_AGORA_APP_CERTIFICATE`, `AGORA_CUSTOMER_SECRET`, and `SOLANA_PRIVATE_KEY` server-side only.
- Do not log secret values.
- Do not commit `.env.local`, `.solana-keypair.json`, `key_and_secret.txt`, or private key files.
- Rotate any credentials that were committed before this cleanup.

## Current Limits

- Demo MVP routes are unauthenticated.
- No rate limiting is implemented.
- Solana receipts prove a hash was recorded, not that Agora cryptographically signed the transcript.

## Production Hardening

- Add authenticated session ownership for all mutation routes.
- Add rate limiting to token, agent, RTT, and Solana routes.
- Store raw transcript data in a controlled backend if auditors need content verification.
- Add structured telemetry and alerting for agent start failures, RTT failures, and Solana mint failures.
