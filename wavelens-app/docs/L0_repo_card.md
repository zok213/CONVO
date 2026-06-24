# WaveLens Lite Repo Card

## Identity

| Field | Value |
| --- | --- |
| App | `wavelens-app` |
| Type | Next.js demo MVP |
| Stack | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Runtime | Browser WebRTC + Next.js API routes |
| Canonical Demo | `/demo` on port `3001` |
| Last Reviewed | 2026-06-24 |

## Runtime Summary

`/demo` mounts `LiveSession`, which requests microphone access, starts a signed Agora RTC session, starts an Agora Conversational AI agent, optionally starts Agora real-time STT translation, publishes microphone audio after RTC reaches `CONNECTED`, renders bilingual turns, and records final bilingual turn hashes as Solana Metaplex Core Safety Pass assets when a funded signer is available.

## L1 Docs

| File | Purpose |
| --- | --- |
| [01_setup](L1/01_setup.md) | Local setup, env, commands |
| [02_architecture](L1/02_architecture.md) | End-to-end runtime architecture |
| [03_code_map](L1/03_code_map.md) | Source ownership and change map |
| [05_workflows](L1/05_workflows.md) | Common development workflows |
| [06_interfaces](L1/06_interfaces.md) | API and env contracts |
| [07_gotchas](L1/07_gotchas.md) | Known pitfalls |
| [08_security](L1/08_security.md) | Security and trust boundaries |
