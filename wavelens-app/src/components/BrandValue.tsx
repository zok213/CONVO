"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

const brandValues = [
  {
    title: "Open-ear safety for industrial crews",
    subtitle: "Bone-conduction keeps ears open",
    desc: "Bone-conduction keeps ears open for alarms and ambient noise while translated audio is delivered directly through your cheekbones.",
    img: "/images/tech1.png",
    href: "#technology",
  },
  {
    title: "Low-latency voice translation",
    subtitle: "Agora CAI Engine v2.6",
    desc: "Agora CAI Engine v2.6 handles VAD, AEC, and noise suppression to deliver fast, clear translations in 85–110 dB port and engine-room environments.",
    img: "/images/tech2.png",
    href: "#technology",
  },
  {
    title: "Verifiable bilingual audit trail",
    subtitle: "SHA-256 → Solana receipts",
    desc: "Agora Real-Time STT + Translation generates bilingual transcripts whose SHA-256 hashes are stored on Solana as immutable receipts, supporting SOLAS-style audit needs.",
    img: "/images/tech3.png",
    href: "#technology",
  },
  {
    title: "Powered by Agora + Solana",
    subtitle: "Hackathon stack",
    desc: "Combining Agora CAI Engine v2.6 for voice transport and AI, Solana for immutable audit receipts, and Shokz for bone-conduction audio output.",
    img: "/images/tech4.png",
    href: "#technology",
  },
];

export default function BrandValue() {
  return (
    <section id="technology" className="scroll-mt-16 py-16 md:py-24 bg-gray-50">
      <div className="page-width">
        <h2 className="text-3xl md:text-4xl font-heading text-center mb-2">
          Technology
        </h2>
        <p className="text-center text-gray-500 mb-10 max-w-xl mx-auto">
          Three layers: voice translation, bone-conduction audio, and immutable audit trail.
        </p>
      </div>

      <div className="relative max-w-[1348px] mx-auto px-5">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation={{ prevEl: ".brand-prev", nextEl: ".brand-next" }}
          pagination={{ el: ".brand-pagination", clickable: true }}
          breakpoints={{
            0: { slidesPerView: 1.2, spaceBetween: 16 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
          className="!px-0"
        >
          {brandValues.map((item) => (
            <SwiperSlide key={item.title}>
              <a href={item.href} className="block group">
                <div className="aspect-[4/3] overflow-hidden mb-4 bg-gray-200">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-lg font-heading mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-1">{item.subtitle}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </a>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          className="brand-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md transition-transform transition-shadow transition-colors duration-150 ease-out cursor-pointer hover:scale-105 hover:shadow-lg hover:bg-neutral-100 active:scale-95 active:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a3d] focus-visible:ring-offset-2"
          aria-label="Previous technology feature"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          className="brand-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md transition-transform transition-shadow transition-colors duration-150 ease-out cursor-pointer hover:scale-105 hover:shadow-lg hover:bg-neutral-100 active:scale-95 active:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a3d] focus-visible:ring-offset-2"
          aria-label="Next technology feature"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="brand-pagination flex justify-center mt-6" />
      </div>
    </section>
  );
}
