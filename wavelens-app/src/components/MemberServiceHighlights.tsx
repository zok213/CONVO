"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { Mic, Ear, Shield, FileText } from "lucide-react";

const highlights = [
  { icon: Mic, text: "Real-time VI → EN translation" },
  { icon: Ear, text: "Bone-conduction keeps ears open" },
  { icon: Shield, text: "SHA-256 audit trail on Solana" },
  { icon: FileText, text: "Agora CAI Engine v2.6 powered" },
];

export default function MemberServiceHighlights() {
  return (
    <div
      className="py-3"
      style={{
        background: "linear-gradient(90deg, #0c1a2d -3.89%, #1a3a5c 100%)",
      }}
    >
      <div className="page-width">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop
          breakpoints={{
            0: { slidesPerView: 2 },
            640: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="!mx-0"
        >
          {highlights.map((item) => (
            <SwiperSlide key={item.text}>
              <div className="flex items-center gap-2 text-white text-sm justify-center">
                <item.icon className="w-3.5 h-3.5 text-[#06b6d4]" />
                <span>{item.text}</span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
