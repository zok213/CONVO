"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

const slides = [
  {
    id: "wavelens-demo-kit",
    title: "WaveLens Lite Demo Kit",
    tag: "Hackathon Prototype",
    desc: "Real-time Vietnamese-to-English voice translation for port and ship crews ” through bone-conduction headsets.",
    btnPrimary: { text: "Start Live Demo", href: "/demo" },
    btnSecondary: { text: "View Tech Stack", href: "#technology" },
    imgDesktop: "/images/1st_banner.png",
    imgMobile: "/images/1st_banner.png",
    textLight: true,
  },
  {
    id: "how-it-works",
    title: "Keep ears open. Translate through bone conduction.",
    tag: "Agora CAI Engine v2.6",
    desc: "Vietnamese speech → Agora CAI translation → English audio to WaveL headset + bilingual text hashed to Solana.",
    btnPrimary: { text: "Try the Demo", href: "/demo" },
    btnSecondary: { text: "How It Works", href: "#product-collection" },
    imgDesktop: "/images/2nd_banner.png",
    imgMobile: "/images/2nd_banner.png",
    textLight: true,
  },
];

export default function HeroSlideshow() {
  return (
    <section className="relative min-h-screen -mt-[60px] md:-mt-[69px] flex flex-col">
      <Swiper
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        effect="fade"
        speed={300}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation={{
          prevEl: ".slideshow-button-prev",
          nextEl: ".slideshow-button-next",
        }}
        pagination={{
          el: ".slideshow-pagination",
          clickable: true,
          bulletClass: "swiper-pagination-bullet !w-2 !h-2 !rounded-full !bg-gray-400 !opacity-100 transition-all duration-300",
          bulletActiveClass: "swiper-pagination-bullet-active !w-6 md:!w-8 !bg-black",
        }}
        className="w-full flex-1"
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={slide.id} className="!h-auto">
            <div className="relative w-full h-screen">
              <picture>
                <source media="(max-width: 767px)" srcSet={slide.imgMobile} />
                <img
                  src={slide.imgDesktop}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              </picture>

              <div className="absolute inset-0 bg-black/30" />

              <div className="absolute inset-0 flex items-center pt-[60px] md:pt-[69px]">
                <div className="page-width w-full">
                  <div className="max-w-sm sm:max-w-md lg:max-w-lg text-white">
                    {slide.tag && (
                      <div className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-white/70">
                        {slide.tag}
                      </div>
                    )}
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading leading-[1.1] mb-2 sm:mb-4 text-white">
                      {slide.title}
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 text-white/80">
                      {slide.desc}
                    </p>
                    <div className="flex gap-2 sm:gap-3">
                      <a href={slide.btnPrimary.href} className="btn-primary text-xs sm:text-sm">
                        {slide.btnPrimary.text}
                      </a>
                      <a href={slide.btnSecondary.href} className="btn-outline text-xs sm:text-sm !text-white !border-white hover:!bg-white/20">
                        {slide.btnSecondary.text}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
