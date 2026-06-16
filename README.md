# CONVO-ONEVOICE

Real-time multilingual voice translation for industrial environments, powered by the Agora Conversational AI Engine.

Built on the [Agora Next.js Quickstart](https://github.com/AgoraIO-Conversational-AI/agent-quickstart-nextjs) with domain-specific system prompts for maritime port and ship operations.

---

## Project Structure

\\\
agora/
├── .gitignore                  # Root gitignore (env secrets, build artifacts)
├── README.md                   # This file
├── .agora/
│   └── project.json            # Agora SDK project metadata
├── docs/                       # Project documentation
│   ├── CHECKLIST.md
│   ├── WaveLens_Lite_v6_DaNang2026.md
│   └── assets/
├── archive/                    # Legacy files preserved for reference
│   ├── config.js / config.json
│   ├── docs/
│   └── scripts/
├── translator-app/             # Next.js application (main entry point)
│   ├── app/                    # App Router: pages, layouts, API routes
│   ├── components/             # React components (conversation UI, panels)
│   ├── lib/                    # Agora SDK wrappers, utilities
│   ├── types/                  # TypeScript type definitions
│   ├── public/                 # Static assets (icons, logos, SVGs)
│   ├── scripts/                # Dev utility scripts (doctor, verify-api)
│   ├── docs/                   # AI developer documentation
│   └── .github/                # CI workflows
└── WaveLens_Lite_v6_DaNang2026_A4.pdf  # Hackathon submission PDF
\\\

---

## Prerequisites

- **Node.js 22+** (with corepack enabled for pnpm)
- **pnpm** (included via corepack: \corepack enable && corepack install\)
- **Agora account** with a project that has:
  - App ID and App Certificate enabled
  - Conversational AI Engine add-on activated
  - Reseller billing for STT/LLM/TTS configured in Agora Console

---

## Setup

### 1. Clone and install

\\\ash
cd translator-app
pnpm install
\\\

### 2. Configure environment variables

Copy the example file and fill in your Agora credentials:

\\\ash
cp env.local.example .env.local
\\\

Required variables:

| Variable | Description |
|---|---|
| \NEXT_PUBLIC_AGORA_APP_ID\ | Agora Console > Project > App ID |
| \NEXT_AGORA_APP_CERTIFICATE\ | Agora Console > Project > App Certificate (server-side only) |

Optional variables:

| Variable | Default | Description |
|---|---|---|
| \NEXT_PUBLIC_AGENT_UID\ | \123456\ | UID the AI agent joins the channel with |
| \NEXT_AGENT_GREETING\ | Ada greeting | Override the agent's opening line |
| \SOLANA_PRIVATE_KEY\ | (ephemeral) | Solana devnet keypair for audit trail receipts |

### 3. Run the dev server

\\\ash
pnpm dev
\\\

Opens at [http://localhost:3000](http://localhost:3000).

### 4. Verify setup

\\\ash
pnpm run doctor          # Check prerequisites and env binding
pnpm run lint            # ESLint
pnpm run typecheck       # TypeScript type check
pnpm run verify:api      # API route contract checks
pnpm run verify          # All of the above + production build
\\\

---

## Architecture

The browser requests an RTC + RTM token from \/api/generate-agora-token\, joins the channel, and publishes microphone audio. The Agora Conversational AI Engine joins the same channel and runs the STT > LLM > TTS pipeline in Agora Cloud. Transcript and agent state events flow over RTM.

**Pipeline**: Deepgram (STT, reseller) > OpenAI GPT-4o/GPT-4o-mini (LLM, reseller) > MiniMax (TTS, reseller)

No external API keys are required for the default pipeline - models are billed through the Agora Console reseller agreement. See \pp/api/invite-agent/route.ts\ for BYOK (Bring Your Own Key) blocks that can be uncommented to use your own vendor credentials.

### Domain Modes

The agent supports two system prompt profiles, selected via the \domain\ field in the invite request:

- **\maritime\** — Vietnamese-English interpreter with specialized maritime glossary (port operations, engine room, deck). Uses \gpt-4o\.
- **\coaching\** — Developer advocate persona explaining Agora's Conversational AI platform. Uses \gpt-4o-mini\.

---

## API Routes

| Route | Method | Status | Description |
|---|---|---|---|
| \/api/generate-agora-token\ | GET | Working | Issues RTC + RTM tokens |
| \/api/invite-agent\ | POST | Working* | Starts an agent session with configurable domain/STT/LLM/TTS |
| \/api/stop-conversation\ | POST | Working | Stops the agent session |
| \/api/log-session\ | POST | Partial** | Logs conversation metadata |
| \/api/stt-translation\ | POST | Present | STT translation endpoint |
| \/api/chat/completions\ | POST | Present | Chat completions proxy |
| \/api/solana/record\ | POST | Present | Records audit hash to Solana devnet |
| \/api/solana/verify\ | POST | Present | Verifies audit hash on Solana devnet |

\* Requires valid \NEXT_PUBLIC_AGORA_APP_ID\ and \NEXT_AGORA_APP_CERTIFICATE\ in \.env.local\.
\*\* Dev server may hang during SSR compilation on Windows. Works correctly in production build or on Linux/macOS.

---

## Known Issues

- **Dev server compilation on Windows**: The Next.js webpack dev server may hang during SSR compilation on Windows. Use \pnpm build && pnpm start\ for production mode, or run on Linux/macOS for hot reload.
- **Solana integration**: Present as an add-on. Requires valid Solana devnet credentials for full functionality. Not required for core voice translation features.

---

## Environment Files

- \	ranslator-app/.env.local\ — App credentials (gitignored, never commit)
- \	ranslator-app/env.local.example\ — Template with all documented variables
- Root \.env.local\ was removed during cleanup (contained duplicate credentials)

Both root and app-level \.gitignore\ files exclude \.env*\ patterns.

---

## Commands (from translator-app)

\\\ash
pnpm dev           # Start dev server (webpack)
pnpm build         # Production build
pnpm start         # Start production server
pnpm run lint      # ESLint
pnpm run typecheck # tsc --noEmit
pnpm run doctor    # Prerequisites + env binding check
pnpm run verify:api # API contract verification
pnpm run verify    # doctor + lint + typecheck + verify:api + build
\\\

---

## Reference

- [Agora Conversational AI Docs](https://docs.agora.io/en/conversational-ai/)
- [Agent UIKit](https://agoraio-conversational-ai.github.io/agent-uikit/)
- [Agent Client Toolkit](https://github.com/AgoraIO-Conversational-AI/agent-client-toolkit-ts)
- [Agora CLI](https://github.com/AgoraIO-Community/cli)