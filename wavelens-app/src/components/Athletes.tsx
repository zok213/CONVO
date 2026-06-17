"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

const tabs = ["Port Ops", "Engine Room", "Deck Crew"];

const testimonialsData: Record<string, { name: string; quote: string; img: string; role: string }[]> = {
  "Port Ops": [
    { name: "Nguyễn Minh Tùng", quote: "Before WaveLens Lite, I had to guess English instructions over the radio. Now I hear a clear Vietnamese translation in my headset and keep both hands on the crane controls.", img: "/images/1st_banner.png", role: "Crane Operator — Cảng Tiên Sa, Đà Nẵng" },
    { name: "Lê Thị Khánh Ly", quote: "When foreign vessels arrive late at night, we switch on WaveLens Lite and everyone is on the same page within minutes. It saves us from repeating the same instructions three times.", img: "/images/2nd_banner.png", role: "Yard Planner — Logistics center, Thủ Đức" },
    { name: "Carlos Jiménez", quote: "Working with Vietnamese operators used to require a standby interpreter. With WaveLens Lite, I can speak English and see the Vietnamese transcript logged for every move.", img: "/images/2nd_banner.png", role: "Vessel Planner — Joint-venture terminal, Hải Phòng" },
  ],
  "Engine Room": [
    { name: "Trần Quốc Phúc", quote: "Engine rooms are too loud for phones. WaveLens Lite lets my team hear translated instructions without blocking alarms or the sound of the machinery.", img: "/images/2nd_banner.png", role: "Chief Engineer — Coastal tanker, Central Vietnam" },
    { name: "Park Ji-hoon", quote: "I can inspect Vietnamese vessels and explain maintenance tasks in English while WaveLens Lite handles the Vietnamese translation and audit trail.", img: "/images/1st_banner.png", role: "Korean Technical Superintendent — Visiting Vietnamese shipyards" },
    { name: "Phạm Thị Ngọc Anh", quote: "I used to rely on a phrasebook in the control room. Now I just speak Vietnamese and the English comes out through my bone-conduction headset in under a second.", img: "/images/1st_banner.png", role: "Junior Engineer — Container vessel on the East–West corridor" },
  ],
  "Deck Crew": [
    { name: "Đỗ Văn Khải", quote: "During safety drills, our foreign officers give commands in English and we hear Vietnamese immediately. It makes it easier to prove to inspectors that we followed procedures.", img: "/images/1st_banner.png", role: "Bosun — Bulk carrier, Central Vietnam" },
    { name: "Maria Santos", quote: "WaveLens Lite helps me brief mixed crews in one go. I speak English, they hear Vietnamese, and we keep a bilingual record of the drill on Solana.", img: "/images/2nd_banner.png", role: "Safety Officer — International cruise ship docking in Đà Nẵng" },
    { name: "Ngô Hữu Long", quote: "Learning nautical English is still important, but WaveLens Lite gives me a safety net when I'm tired or under pressure.", img: "/images/2nd_banner.png", role: "Deck Cadet — Training vessel, maritime university" },
  ],
};

export default function Athletes() {
  const [activeTab, setActiveTab] = useState("Port Ops");
  const currentTestimonials = testimonialsData[activeTab] || [];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="page-width">
        <h2 className="text-3xl md:text-4xl font-heading text-center mb-2">
          Testimonials
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Hear from port and maritime crews
        </p>

        <div className="flex justify-center gap-6 mb-10 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors shrink-0 ${
                activeTab === tab
                  ? "border-[#ff7a3d] text-[#ff7a3d]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="relative max-w-[1348px] mx-auto px-5">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation={{ prevEl: ".athlete-prev", nextEl: ".athlete-next" }}
          pagination={{ el: ".athlete-pagination", clickable: true }}
          breakpoints={{
            0: { slidesPerView: 1.1, spaceBetween: 16 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
          className="!px-0"
        >
          {currentTestimonials.map((t) => (
            <SwiperSlide key={t.name}>
              <div className="group">
                <div className="aspect-[3/4] overflow-hidden mb-4 bg-gray-100">
                  <img src={t.img} alt={t.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <p className="text-sm text-gray-600 italic mb-2">&ldquo;{t.quote}&rdquo;</p>
                <div className="font-medium text-gray-900">{t.name}</div>
                <div className="text-xs text-gray-500">{t.role}</div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button className="athlete-prev absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button className="athlete-next absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="athlete-pagination flex justify-center mt-6" />
      </div>
    </section>
  );
}
