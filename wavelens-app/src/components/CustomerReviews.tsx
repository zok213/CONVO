"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const reviews = [
  {
    text: "The translation is fast enough for real-time conversation. I can hear the English through my WaveL headset while my phone mic picks up my Vietnamese.",
    author: "Crane Operator",
    rating: 5,
    context: "Port of Da Nang trial",
  },
  {
    text: "Finally, a solution that doesn't require me to take my hands off the controls. The bone-conduction audio means I can still hear my surroundings.",
    author: "Deck Foreman",
    rating: 5,
    context: "Container terminal demo",
  },
  {
    text: "The Solana audit trail gives our safety officers confidence that drills are being conducted properly without recording sensitive crew conversations.",
    author: "Maritime Safety Inspector",
    rating: 4,
    context: "Compliance review",
  },
  {
    text: "We tested this in the engine room at full throttle ” it handled the noise floor incredibly well. The translated English was clear.",
    author: "Chief Engineer",
    rating: 5,
    context: "Engine room trial",
  },
  {
    text: "Vietnamese to English is just the start. We need Korean and Chinese next, but this MVP proves the concept works in our environment.",
    author: "Port Operations Manager",
    rating: 4,
    context: "Field assessment",
  },
];

export default function CustomerReviews() {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-gray-50">
      <div className="page-width mb-6 sm:mb-8 md:mb-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading text-center mb-1 sm:mb-2">
          Early Field Feedback
        </h2>
        <p className="text-center text-sm sm:text-base text-gray-400">
          Tested by maritime professionals in port and ship environments.
        </p>
      </div>

      <div className="relative max-w-[1248px] mx-auto px-4 sm:px-5">
        <Swiper
          modules={[Navigation]}
          navigation={{ prevEl: ".review-prev", nextEl: ".review-next" }}
          breakpoints={{
            0: { slidesPerView: 1.1, spaceBetween: 12 },
            480: { slidesPerView: 1.5, spaceBetween: 16 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 24 },
          }}
          className="!px-0"
        >
          {reviews.map((review, idx) => (
            <SwiperSlide key={idx}>
              <div className="bg-white rounded-lg sm:rounded-xl border border-gray-100 p-4 sm:p-6 h-full flex flex-col">
                <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < review.rating ? "fill-[#ff7a3d] text-[#ff7a3d]" : "fill-gray-200 text-gray-200"}`} />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed flex-1 mb-3 sm:mb-4">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div>
                  <div className="text-sm sm:text-base font-medium text-gray-900">{review.author}</div>
                  <div className="text-xs sm:text-sm text-gray-400">{review.context}</div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button className="review-prev absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button className="review-next absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </section>
  );
}
