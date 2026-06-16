# WaveLens Lite 🌊

**Bone-Conduction Conversational Interpreter · Agora × Solana**  
*Built for the Convo AI Hackathon — Đại học Bách Khoa Đà Nẵng 2026*

---

## 📖 Overview

**WaveLens Lite** is a real-time conversational interpreter built for industrial and maritime environments (ports, ship engine rooms, open decks). It enables Vietnamese workers to communicate seamlessly with English, Korean, or Chinese supervisors using bone-conduction headsets, solving communication barriers where phones are impractical and blocking your ears is dangerous.

The application leverages a dual-channel architecture:
1. **Voice Channel**: Real-time voice translation via **Agora CAI Engine**.
2. **Text Audit Channel**: Bilingual compliance records via **Agora Real-Time STT + Translation**, anchored to the **Solana** blockchain for immutable verification (e.g., SOLAS compliance drills).

---

## 📂 Repository Structure

This repository has been reorganized for clarity. The final technical design documents and assets are located in the `docs/` directory.

```text
📦 agora/
├── 📄 README.md                        # This file
├── 📂 docs/                            # Core documentation
│   ├── WaveLens_Lite_v6_DaNang2026.md  # The complete Technical Design Document (Markdown)
│   ├── legacy_technical_document.md    # Legacy planning document
│   └── 📂 assets/                      # Diagrams and charts (e.g., gantt_chart.png)
├── 📄 WaveLens_Lite_v6_DaNang2026_A4.pdf # The final, compiled, presentation-ready Hackathon PDF
├── 📂 scripts/                         # Utility scripts (mermaid formatters)
├── 📂 debug/                           # Temporary render files and debug assets
├── 📂 translator-app/                  # Application source code (Next.js)
├── 📂 programs/wavelens-audit/         # Solana BPF program (Rust, future use)
│   └── src/lib.rs                      # record_hash + verify_hash instructions
└── 📂 backend/                         # Rust Axum backend (future use)
    └── src/                            # solana client, routes
```

---

## 🚀 Core Technology Stack

| Layer | Technology | Role |
|---|---|---|
| **Voice Transport** | Agora SDRTN™ | UDP audio, 80% packet loss tolerance |
| **Voice Orchestration** | Agora CAI Engine v2.6 | VAD, AEC, noise suppression, MLLM routing |
| **Text Audit** | Agora Real-Time STT & Translation | Bilingual text generation for the blockchain hash |
| **AI Models** | `gpt-realtime-2` & `gpt-realtime-translate` | Domain-specific routing (Maritime vs. Coaching) |
| **Backend** | Next.js API Routes | Session logging, Solana RPC bridge (server-side) |
| **Audit Trail** | Solana Memo Program + `@solana/web3.js` | SHA-256 hash receipts on devnet via Memo instructions |
| **Rust BPF** | Solana SDK (parked) | Custom `record_hash` + `verify_hash` program (future deploy) |
| **Hardware** | Shokz OpenRun Pro 2 | Bone-conduction demo output device |

---

## 🏆 Hackathon Artifacts

The definitive technical blueprint and system architecture for our submission is compiled in the A4 PDF format. 

👉 **[View the Official Hackathon Submission PDF](WaveLens_Lite_v6_DaNang2026_A4.pdf)** 👈

### Key Architectural Highlights in the Document:
- **Dual-Channel Design**: Why we run Voice (CAI) and Text (RTT) in parallel.
- **AI Domain Routing**: When to use `gpt-realtime-translate` vs `gpt-realtime-2`.
- **Solana Integration**: How the dual-account (Receipt + Usage) architecture prevents payment disputes from corrupting audit logs.
- **Latency Targets**: P50 ~670ms E2E translation latency.

---

## 🛠️ How to Build the PDF

If you make future edits to `docs/WaveLens_Lite_v6_DaNang2026.md` and need to recompile the PDF, use the `md2pdf` tool from the root directory:

```bash
md2pdf docs/WaveLens_Lite_v6_DaNang2026.md -o WaveLens_Lite_v6_DaNang2026_A4.pdf --page-size a4
```

*(Note: The Gantt chart has been pre-rendered and saved in `docs/assets/gantt_chart.png` to ensure flawless layout scaling during the PDF build.)*
