# 06 Interfaces

## Session APIs

### `POST /api/session/start`

Success:

```json
{ "appId": "...", "token": "...", "channel": "wavelens-...", "uid": "12345", "sessionId": "session_..." }
```

Requires `NEXT_PUBLIC_AGORA_APP_ID` and `NEXT_AGORA_APP_CERTIFICATE`.

### `POST /api/session/agent/start`

Body:

```json
{ "channel": "wavelens-...", "uid": "12345", "domain": "maritime", "langSrc": "vi-VN", "langTgt": "en-US" }
```

Success:

```json
{ "agentId": "...", "agent_id": "...", "state": "RUNNING" }
```

### `POST /api/session/rtt/start`

Body:

```json
{ "sessionId": "session_...", "channel": "wavelens-...", "langSrc": "vi-VN", "langTgt": "en-US" }
```

Success with REST credentials:

```json
{ "rttAgentId": "...", "agentId": "...", "state": "RUNNING", "sessionId": "session_..." }
```

Missing optional REST credentials returns `501` with state `STANDBY`.

### `POST /api/session/end`

Body:

```json
{ "sessionId": "session_...", "agentId": "...", "rttAgentId": "..." }
```

Success:

```json
{ "status": "ended", "sessionId": "session_...", "agent": "stopped", "rtt": "stopped" }
```

## Solana APIs

### `POST /api/solana/record`

Body:

```json
{ "hash": "<64 hex chars>", "timestamp": 1710000000000, "channelName": "wavelens-...", "domain": "maritime", "messageCount": 12 }
```

Success:

```json
{ "success": true, "assetId": "...", "solanaExplorerUrl": "https://explorer.solana.com/address/...?cluster=devnet" }
```

### `GET /api/solana/verify?assetId=...`

`tx` is accepted as an alias for `assetId`.

Success:

```json
{ "success": true, "assetId": "...", "receipt": { "hash": "...", "timestamp": 1710000000000, "channelName": "...", "domain": "maritime", "messageCount": 12 } }
```

## Env Contract

Required: `NEXT_PUBLIC_AGORA_APP_ID`, `NEXT_AGORA_APP_CERTIFICATE`.

Optional: `AGORA_CUSTOMER_ID`, `AGORA_CUSTOMER_SECRET`, `SOLANA_PRIVATE_KEY`, `SESSION_WEBHOOK_URL`, `NEXT_LLM_API_KEY`, `NEXT_LLM_URL`.
