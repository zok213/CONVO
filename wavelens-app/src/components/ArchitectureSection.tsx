"use client";

import { useState } from "react";
import { CheckCircle2, CircleDot, ArrowRightFromLine, Wifi, Cpu, FileText, Database } from "lucide-react";

export default function ArchitectureSection() {
  const [tab, setTab] = useState<"mvp" | "production">("mvp");

  return (
    <section id="architecture" className="scroll-mt-16 py-16 sm:py-24 bg-gray-50">
      <div className="page-width">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
          System architecture
        </h2>
        <p className="text-center text-gray-500 text-sm sm:text-base mb-8 sm:mb-10 max-w-lg mx-auto">
          Hackathon MVP vs production path.
        </p>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-xl border border-gray-200 p-1">
            {(["mvp", "production"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                  tab === t
                    ? "bg-[#06b6d4] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "mvp" ? "Hackathon MVP (shipped)" : "Production path"}
              </button>
            ))}
          </div>
        </div>

        {/* Architecture diagram */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-5 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex flex-col items-center gap-1 p-3 bg-blue-50 rounded-lg min-w-[80px]">
              <Wifi className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-700">Phone</span>
            </div>
            <ArrowRightFromLine className="w-4 h-4 text-gray-300 hidden sm:block" />
            <div className="flex flex-col items-center gap-1 p-3 bg-cyan-50 rounded-lg min-w-[80px]">
              <Cpu className="w-5 h-5 text-[#06b6d4]" />
              <span className="font-medium text-[#06b6d4]">Agora CAI</span>
            </div>
            <ArrowRightFromLine className="w-4 h-4 text-gray-300 hidden sm:block" />
            <div className="flex flex-col items-center gap-1 p-3 bg-purple-50 rounded-lg min-w-[80px]">
              <Database className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-700">AI Provider</span>
            </div>
            <ArrowRightFromLine className="w-4 h-4 text-gray-300 hidden sm:block" />
            <div className="flex flex-col items-center gap-1 p-3 bg-green-50 rounded-lg min-w-[80px]">
              <Headphones className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-700">Shokz</span>
            </div>
          </div>
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-400 bg-gray-50 rounded-lg px-4 py-2">
              <span>Parallel: Agora RTT → Backend → Solana audit</span>
            </div>
          </div>
        </div>

        {/* Tab content */}
        {tab === "mvp" ? (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-5 sm:p-8">
            <p className="text-sm sm:text-base text-gray-600 mb-5">
              This is what runs today for the demo.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Wifi, label: "Real-time voice transport", desc: "Agora SDRTN (UDP audio)" },
                { icon: Cpu, label: "Voice AI", desc: "Agora CAI Engine v2.6 with MLLM routing" },
                { icon: FileText, label: "Text audit", desc: "Agora Real-Time STT + Translation Beta" },
                { icon: Database, label: "AI providers", desc: "gpt-realtime-translate and gpt-realtime-2 via Agora MLLM" },
                { icon: CircleDot, label: "Backend", desc: "Next.js API routes (FastAPI design in progress)" },
                { icon: CircleDot, label: "Solana audit trail", desc: "Design ready, integration TBD" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                  <item.icon className="w-4 h-4 text-[#06b6d4] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{item.label}</div>
                    <div className="text-xs sm:text-sm text-gray-500">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-5 sm:p-8">
            <p className="text-sm sm:text-base text-gray-600 mb-5">
              Beyond the hackathon ” production hardening.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Convo AI Device Kit R1", desc: "Integrated dual-mic array hardware with LTE for always-on connectivity." },
                { label: "Offline Tier 3", desc: "PhoWhisper medium model + local phrase bank for no-internet fallback." },
                { label: "Solana x402 + full audit", desc: "USDC micropayments for per-session billing + complete audit pipeline." },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-lg border border-gray-100">
                  <h4 className="text-sm font-semibold mb-1">{item.label}</h4>
                  <p className="text-xs sm:text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Headphones(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}
