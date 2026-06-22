import { ExternalLink } from "lucide-react";

export default function AboutFooter() {
  return (
    <footer id="about" className="scroll-mt-16 bg-[#0c1a2d] text-white">
      <div className="page-width py-12 sm:py-16">
        {/* About */}
        <div className="max-w-xl mb-10 sm:mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-[#06b6d4]">WaveLens Lite</span>
            <span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded">× Shokz</span>
          </div>
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
            Built for the Convo AI Hackathon 2026 at Đại học Bách Khoa Đà Nẵng.
            WaveLens Lite brings real-time Vietnamese-to-English voice translation
            to maritime and industrial workers using bone-conduction audio.
          </p>
        </div>

        {/* Team note */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-gray-500">
              WaveLens Lite ” built for{" "}
              <span className="text-gray-300 font-medium">
                Agora × Solana Convo AI Hackathon
              </span>
              , Đại học Bách Khoa Đà Nẵng 2026.
            </p>
            <a
              href="#"
              className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 hover:text-[#06b6d4] transition-colors no-underline"
            >
              <ExternalLink className="w-4 h-4" />
              GitHub repo
            </a>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 pt-4 border-t border-gray-800/50">
          <p className="text-[10px] sm:text-xs text-gray-600 leading-relaxed">
            This MVP is a hackathon prototype. It is not certified for live safety-critical
            operations. Do not use for real-time life safety decisions. Always maintain
            situational awareness in industrial environments.
          </p>
        </div>
      </div>
    </footer>
  );
}
