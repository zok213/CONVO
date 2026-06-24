# 07 Gotchas

## Runtime

- Publishing mic before Agora RTC is `CONNECTED` can cause `INVALID_OPERATION`.
- Changing language/domain must remount the session so backend context stays aligned.
- RTT credentials are optional; a `501` from `/api/session/rtt/start` is standby, not a fatal demo failure.
- Final bilingual turns are the only audit candidates. Local hash generation alone is not a Solana confirmation.

## Secrets

- `NEXT_AGORA_APP_CERTIFICATE`, `AGORA_CUSTOMER_SECRET`, and `SOLANA_PRIVATE_KEY` must never enter client code.
- `.solana-keypair.json` and local key files are ignored and should not be committed.
- Any previously committed keys should be rotated.

## Solana

- Recording requires a funded devnet signer.
- A failed mint should show Solana error/standby in the UI, not crash the session.
- The Demo MVP stores hash summary attributes only; it does not upload raw transcript JSON.

## Verification

- `npm run doctor` may fail until live env vars are configured.
- `npm run verify:api` is source-level and does not call Agora or Solana networks.
- Hardware, Wi-Fi, latency, and headset routing remain manual acceptance checks.
