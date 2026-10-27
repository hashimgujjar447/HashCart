'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface Slide {
  id: number;
  kicker: string;
  titleLine1: string;
  titleLine2: string;
  discountText: string;
  discountHighlight: string;
  discountSuffix: string;
  buttonText: string;
  buttonLink: string;
  imageSrc: string;
  imageAlt: string;
  badge?: string;
  bgGradient: string;
  accentColor: string;
}

const slides: Slide[] = [
  {
    id: 1,
    kicker: 'Flagship Edition 2025',
    titleLine1: 'Precision Crafted',
    titleLine2: 'Smart Timepieces',
    discountText: 'Starting from ',
    discountHighlight: '$40',
    discountSuffix: ' · Limited weekly release',
    buttonText: 'Shop Collection',
    buttonLink: '/products',
    imageSrc: '/hero/smartwatch.png',
    imageAlt: 'Smart Watch Collection 2025',
    badge: 'Curated Selection',
    bgGradient: 'from-[#0f172a] via-[#1e293b] to-[#0f172a]',
    accentColor: '#38bdf8',
  },
  {
    id: 2,
    kicker: 'Next-Gen Wearables',
    titleLine1: 'Sleek Dual Series',
    titleLine2: 'Performance Pro',
    discountText: 'Save up to ',
    discountHighlight: '25% off',
    discountSuffix: ' on verified seller orders',
    buttonText: 'Explore Offers',
    buttonLink: '/products',
    imageSrc: '/hero/watch-pair.png',
    imageAlt: 'Dual Smartwatch Edition',
    badge: 'Trending Now',
    bgGradient: 'from-[#0b192c] via-[#1e3e62] to-[#0b192c]',
    accentColor: '#60a5fa',
  },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const slide = slides[currentSlide];

  return (
    <section className="w-full font-poppins pt-4 pb-6 sm:pb-8">
      <div className="w-[92%] sm:w-[88%] max-w-7xl mx-auto">
        {/* Main Hero Banner */}
        <div
          className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r ${slide.bgGradient} transition-all duration-700 shadow-lg min-h-[360px] sm:min-h-[420px] md:min-h-[460px] flex items-center group`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Subtle Ambient Studio Light (Soft & Natural) */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] sm:w-[480px] h-[300px] sm:h-[480px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/4 -bottom-10 w-72 h-72 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 w-full px-6 sm:px-10 md:px-14 lg:px-16 py-10 sm:py-12 md:py-14 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
            {/* Left Content Column */}
            <div className="w-full md:w-1/2 text-left space-y-3.5 sm:space-y-4">
              {slide.badge && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-sky-200 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-sky-300" />
                  <span>{slide.badge}</span>
                </div>
              )}

              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-slate-300">
                {slide.kicker}
              </p>

              <h1 className="text-2xl sm:text-4xl md:text-[44px] lg:text-[50px] font-extrabold text-white tracking-tight leading-[1.12]">
                <span className="block">{slide.titleLine1}</span>
                <span className="block text-slate-100 mt-1">
                  {slide.titleLine2}
                </span>
              </h1>

              <p className="text-xs sm:text-sm md:text-base text-slate-300 pt-0.5">
                <span>{slide.discountText}</span>
                <span
                  style={{ color: slide.accentColor }}
                  className="font-bold"
                >
                  {slide.discountHighlight}
                </span>
                <span className="text-slate-400">{slide.discountSuffix}</span>
              </p>

              <div className="pt-2 sm:pt-3">
                <Link
                  href={slide.buttonLink}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] group/btn cursor-pointer"
                >
                  <span>{slide.buttonText}</span>
                  <ArrowRight className="w-4 h-4 text-slate-900 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Visual Image Column */}
            <div className="w-full md:w-1/2 flex items-center justify-center md:justify-end relative">
              <div className="relative w-full max-w-[280px] sm:max-w-[360px] md:max-w-[420px] aspect-[4/3] flex items-center justify-center">
                <img
                  src={slide.imageSrc}
                  alt={slide.imageAlt}
                  className="relative z-10 w-auto h-auto max-h-[220px] sm:max-h-[300px] md:max-h-[360px] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.35)] transition-all duration-500 hover:scale-105 select-none"
                  draggable={false}
                />
              </div>
            </div>
          </div>

          {/* Carousel Arrows */}
          <button
            type="button"
            onClick={() =>
              setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))
            }
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/40 hover:bg-slate-900/80 text-white items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer border border-white/10 shadow-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() =>
              setCurrentSlide((prev) => (prev + 1) % slides.length)
            }
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/40 hover:bg-slate-900/80 text-white items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer border border-white/10 shadow-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Pagination Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
            {slides.map((s, index) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === index
                    ? 'w-6 bg-white'
                    : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
