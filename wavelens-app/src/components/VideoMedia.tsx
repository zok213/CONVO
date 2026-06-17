"use client";

import { useRef, useEffect } from "react";

export default function VideoMedia() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-[50vh] sm:min-h-[60vh] md:min-h-[70vh] overflow-hidden"
      style={{
        backgroundImage: "url('/images/3rd_banner.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-4 max-w-2xl relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading text-white mb-3 sm:mb-4 leading-tight">
            Built for Vietnam&apos;s busiest ports
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed max-w-lg mx-auto">
            WaveLens Lite targets Vietnamese maritime workers who need real-time voice
            translation without blocking their ears or hands.
          </p>
        </div>
      </div>
    </section>
  );
}
