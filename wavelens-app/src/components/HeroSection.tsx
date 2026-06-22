import { ArrowRight, Play } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center bg-gradient-to-br from-[#0c1a2d] via-[#0f2847] to-[#0c1a2d] overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      <div className="relative page-width w-full py-16 sm:py-24">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-[#06b6d4] bg-[#06b6d4]/10 px-3 py-1 rounded-full">
              Convo AI Hackathon 2026 ” Đà Nẵng
            </span>
          </div>

          <h1 className="text-[clamp(1.75rem,5vw,3.25rem)] font-bold leading-[1.1] text-white mb-4 sm:mb-6">
            WaveLens Lite ”{" "}
            <span className="text-[#06b6d4]">bone-conduction interpreter</span>{" "}
            for port and ship crews.
          </h1>

          <p className="text-base sm:text-lg leading-relaxed text-gray-300 mb-6 sm:mb-8 max-w-xl">
            Real-time Vietnamese-to-English voice translation through Shokz bone-conduction
            headsets, powered by Agora CAI Engine and secured with Solana audit trails.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <a href="/demo" className="btn-primary gap-2 text-center justify-center">
              <Play className="w-4 h-4" />
              Start Live Demo
            </a>
            <a href="#how-it-works" className="btn-outline !border-gray-600 !text-gray-300 hover:!border-[#06b6d4] hover:!text-[#06b6d4] text-center justify-center">
              See how it works
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Trust row */}
          <div className="mt-8 sm:mt-12 flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              &lt;1.4s P90 latency
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4]" />
              Agora CAI Engine v2.6
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
              Solana audit trail
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
