import { Mic, Repeat2, FileText, Headphones, Lock } from "lucide-react";

const steps = [
  {
    icon: Mic,
    title: "Speak Vietnamese",
    desc: "The worker speaks Vietnamese into a phone or Android device. Agora RTC handles real-time audio transport over SDRTN network.",
    step: "01",
  },
  {
    icon: Repeat2,
    title: "Agora runs voice and text in parallel",
    desc: "Agora CAI Engine v2.6 handles VAD, AEC, and noise suppression on the voice stream. Simultaneously, Agora Real-Time STT + Translation creates a bilingual text stream (Vietnamese + English).",
    step: "02",
  },
  {
    icon: Headphones,
    title: "English audio out, bilingual text on Solana",
    desc: "English audio plays back through Shokz bone-conduction headsets so ears stay open. Bilingual text is hashed with SHA-256 and stored as a receipt on Solana ” no PII, just an immutable audit hash.",
    step: "03",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 py-16 sm:py-24 bg-gray-50">
      <div className="page-width">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
          Two channels: voice for workers, text for auditors
        </h2>
        <p className="text-center text-gray-500 text-sm sm:text-base mb-10 sm:mb-12 max-w-xl mx-auto">
          Real-time voice translation and immutable audit trail ” in parallel.
        </p>

        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
          {steps.map((step, i) => (
            <div key={i} className="relative flex gap-4 sm:gap-6">
              {/* Timeline line */}
              {i < steps.length - 1 && (
                <div className="absolute left-5 top-12 bottom-0 w-px bg-gray-200 hidden sm:block" />
              )}

              {/* Step number */}
              <div className="hidden sm:flex w-10 h-10 rounded-full bg-[#06b6d4]/10 text-[#06b6b4] items-center justify-center text-xs font-bold shrink-0">
                {step.step}
              </div>

              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-[#06b6d4]/10 flex items-center justify-center shrink-0 sm:hidden">
                <step.icon className="w-5 h-5 text-[#06b6d4]" />
              </div>

              {/* Content */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <step.icon className="w-4 h-4 text-[#06b6d4] hidden sm:block" />
                  <h3 className="text-base sm:text-lg font-semibold">{step.title}</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-10">
          <a
            href="#architecture"
            className="btn-outline text-sm"
          >
            View full architecture diagram
          </a>
        </div>
      </div>
    </section>
  );
}
