"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const numbers = [
  { value: "85–110", label: "dB port noise level" },
  { value: "95%", label: "Noise suppression (Agora)" },
  { value: "< 1.4s", label: "P90 latency" },
  { value: "670ms", label: "P50 latency" },
  { value: "SHA-256", label: "Audit hash algorithm" },
  { value: "x402", label: "USDC micropayments" },
];

export default function CompanyNumbers() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="page-width">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 0, disableOnInteraction: false }}
          speed={6000}
          loop
          freeMode
          grabCursor
          slidesPerView="auto"
          className="!mx-0"
        >
          {[...numbers, ...numbers].map((item, idx) => (
            <SwiperSlide key={idx} className="!w-auto">
              <div className="px-8 text-center min-w-[200px]">
                <div className="text-3xl md:text-4xl font-heading text-[#FF4D0A] mb-1">
                  {item.value}
                </div>
                <div className="text-sm text-gray-500">{item.label}</div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
