"use client";

import { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const tabs = ["WaveLens Kit", "WaveL headsets"];

interface Product {
  name: string;
  price: string;
  img: string;
  href: string;
  badge?: string;
  desc?: string;
}

const products: Record<string, Product[]> = {
  "WaveLens Kit": [
    { name: "WaveLens Lite Demo Kit", price: "Hackathon MVP", img: "WaveLensLite1.png", badge: "Prototype", href: "/demo", desc: "Android phone + WaveL headset + interpreter app for VI→EN voice translation in noisy maritime environments." },
    { name: "Maritime Glossary Pack", price: "Pre-loaded", img: "WaveLensLite2.png", href: "/demo", desc: "Domain-specific vocabulary for ballast, engine, deck, and cargo operations." },
    { name: "Agora CAI Engine", price: "v2.6", img: "WaveLensLite3.png", badge: "Powered", href: "/demo", desc: "Low-latency voice translation with VAD, AEC, and 95% noise suppression." },
    { name: "Solana Audit Trail", price: "SHA-256 receipts", img: "WaveLensLite4.png", badge: "Immutable", href: "/demo", desc: "Bilingual transcript hashes stored on Solana as verifiable PDA receipts." },
  ],
  "WaveL headsets": [
    { name: "OpenRun Pro 2", price: "$179.95", img: "2nd_banner.png", badge: "Recommended", href: "/demo", desc: "Flagship bone-conduction headset with premium sound — ideal for WaveLens Lite." },
    { name: "OpenComm2 UC", price: "$199.95", img: "2nd_banner.png", href: "/demo", desc: "Bone-conduction headset with microphone for crew communication." },
    { name: "OpenMeet", price: "$149.95", img: "2nd_banner.png", href: "/demo", desc: "All-day open-ear earbuds for shift workers." },
    { name: "OpenSwim Pro", price: "$229.95", img: "2nd_banner.png", badge: "IP68", href: "/demo", desc: "Waterproof bone-conduction for wet deck environments." },
  ],
};

export default function ProductCollection() {
  const [activeTab, setActiveTab] = useState("WaveLens Kit");
  const currentProducts = products[activeTab] || [];
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabsRef.current) {
      const activeBtn = tabsRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
      if (activeBtn) activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeTab]);

  return (
    <section id="product-collection" className="scroll-mt-16 overflow-hidden py-12 sm:py-16 md:py-24">
      <div className="page-width">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading text-center mb-1 sm:mb-2">
          WaveLens Lite & Compatible Hardware
        </h2>
        <p className="text-center text-sm sm:text-base text-gray-400 mb-6 sm:mb-8">
          Start with the demo kit. Deploy with WaveL headsets.
        </p>

        <div ref={tabsRef} className="flex gap-4 sm:gap-6 mb-6 sm:mb-10 overflow-x-auto scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:mx-0 sm:px-0 sm:justify-center">
          {tabs.map((tab) => (
            <button
              key={tab}
              data-tab={tab}
              onClick={() => setActiveTab(tab)}
              className={`snap-start shrink-0 text-sm font-medium pb-1.5 border-b-2 transition-colors min-h-[44px] ${
                activeTab === tab
                  ? "border-[#ff7a3d] text-[#ff7a3d]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="page-width">
          <Swiper
            modules={[Navigation]}
            navigation={{ prevEl: ".product-prev", nextEl: ".product-next" }}
            breakpoints={{
              0: { slidesPerView: 1.5, spaceBetween: 10 },
              480: { slidesPerView: 2, spaceBetween: 12 },
              640: { slidesPerView: 2.5, spaceBetween: 16 },
              1024: { slidesPerView: 3.5, spaceBetween: 20 },
              1280: { slidesPerView: 4, spaceBetween: 24 },
            }}
            className="!px-0"
          >
            {currentProducts.map((product) => (
              <SwiperSlide key={product.name}>
                <a href={product.href} className="block group">
                  <div className="bg-gray-50 aspect-square overflow-hidden mb-2 sm:mb-3 relative">
                    <img
                      src={`/images/${product.img}`}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    {product.badge && (
                      <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#ff7a3d] text-white text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 font-medium rounded-sm">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-medium text-gray-900 leading-tight">{product.name}</h3>
                  <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{product.price}</p>
                  {product.desc && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">{product.desc}</p>
                  )}
                </a>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <button className="product-prev absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button className="product-next absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      <div className="text-center mt-8 sm:mt-10">
        <a href="/demo" className="btn-primary inline-flex items-center gap-1.5 sm:gap-2">
          Start Live Demo <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </a>
      </div>
    </section>
  );
}
