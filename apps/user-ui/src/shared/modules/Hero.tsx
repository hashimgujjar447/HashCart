'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Star,
  Sparkles,
  Zap,
} from 'lucide-react';

interface Slide {
  id: number;
  badge: string;
  badgeIcon: 'sparkle' | 'zap' | 'star';
  titleLine1: string;
  titleLine2: string;
  description: string;
  pricePrefix: string;
  priceValue: string;
  priceSuffix: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  imageSrc: string;
  imageAlt: string;
  floatingBadgeText: string;
  floatingBadgeRating: string;
  bgGradient: string;
  accentTextColor: string;
  accentBadgeBg: string;
  accentBadgeBorder: string;
}

const slides: Slide[] = [
  {
    id: 1,
    badge: 'Curated 2025 Collection',
    badgeIcon: 'sparkle',
    titleLine1: 'Next-Generation',
    titleLine2: 'Smart Wearables',
    description:
      'Ultra-retina AMOLED display with all-day biometric health & sports tracking.',
    pricePrefix: 'Special launch pricing from ',
    priceValue: '$39.99',
    priceSuffix: ' · Verified merchant warranty',
    primaryButtonText: 'Shop Wearables',
    primaryButtonLink: '/products',
    secondaryButtonText: 'View Flash Deals',
    secondaryButtonLink: '/offers',
    imageSrc: '/hero/smartwatch.png',
    imageAlt: 'Premium Smartwatch 2025',
    floatingBadgeText: 'Top Selling Gadget',
    floatingBadgeRating: '4.9',
    bgGradient: 'from-[#0B132B] via-[#1C2541] to-[#0B132B]',
    accentTextColor: '#F6C90E',
    accentBadgeBg: 'bg-amber-400/10',
    accentBadgeBorder: 'border-amber-400/20 text-amber-300',
  },
  {
    id: 2,
    badge: 'Limited-Time Promotion',
    badgeIcon: 'zap',
    titleLine1: 'Dual Sport Pro',
    titleLine2: 'Connected Series',
    description:
      'Engineered for endurance with aerospace titanium frame and 14-day battery life.',
    pricePrefix: 'Save up to ',
    priceValue: '25% OFF',
    priceSuffix: ' on multi-item orders',
    primaryButtonText: 'Explore Collection',
    primaryButtonLink: '/products',
    secondaryButtonText: 'Browse Shops',
    secondaryButtonLink: '/shops',
    imageSrc: '/hero/watch-pair.png',
    imageAlt: 'Dual Series Smartwatches',
    floatingBadgeText: 'Verified Store Pick',
    floatingBadgeRating: '4.8',
    bgGradient: 'from-[#0F172A] via-[#1E293B] to-[#0F172A]',
    accentTextColor: '#38BDF8',
    accentBadgeBg: 'bg-sky-400/10',
    accentBadgeBorder: 'border-sky-400/20 text-sky-300',
  },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [isHovered]);

  const slide = slides[currentSlide];

  return (
    <section className="w-full font-poppins pt-2 sm:pt-4 pb-4 sm:pb-8">
      <div className="w-[92%] sm:w-[88%] max-w-7xl mx-auto">
        <div
          className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br ${slide.bgGradient} transition-all duration-700 shadow-xl border border-white/10 min-h-[400px] sm:min-h-[440px] md:min-h-[480px] flex items-center group`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Subtle Ambient Studio Lighting */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[320px] sm:w-[480px] h-[320px] sm:h-[480px] bg-white/[0.04] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -bottom-16 w-80 h-80 bg-blue-500/[0.05] rounded-full blur-3xl pointer-events-none" />

          {/* Banner Inner Content */}
          <div className="relative z-10 w-full px-6 sm:px-10 md:px-14 lg:px-16 py-8 sm:py-12 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
            {/* Left Content Column */}
            <div className="w-full md:w-1/2 text-left space-y-3 sm:space-y-4">
              {/* Pill Badge */}
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${slide.accentBadgeBg} ${slide.accentBadgeBorder}`}
              >
                {slide.badgeIcon === 'sparkle' ? (
                  <Sparkles size={13} />
                ) : (
                  <Zap size={13} />
                )}
                <span>{slide.badge}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl lg:text-[46px] font-extrabold text-white tracking-tight leading-[1.12]">
                <span className="block">{slide.titleLine1}</span>
                <span className="block text-slate-200 mt-1">
                  {slide.titleLine2}
                </span>
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 max-w-md line-clamp-2">
                {slide.description}
              </p>

              {/* Price Callout */}
              <div className="pt-1 text-xs sm:text-sm text-slate-300 flex items-center flex-wrap gap-1">
                <span>{slide.pricePrefix}</span>
                <span
                  style={{ color: slide.accentTextColor }}
                  className="font-extrabold text-sm sm:text-base"
                >
                  {slide.priceValue}
                </span>
                <span className="text-slate-400">{slide.priceSuffix}</span>
              </div>

              {/* Actions */}
              <div className="pt-2 sm:pt-4 flex items-center flex-wrap gap-3">
                <Link
                  href={slide.primaryButtonLink}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.98] group/btn cursor-pointer"
                >
                  <span>{slide.primaryButtonText}</span>
                  <ArrowRight className="w-4 h-4 text-slate-900 group-hover/btn:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href={slide.secondaryButtonLink}
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-medium text-xs sm:text-sm backdrop-blur-xs transition-all active:scale-[0.98] cursor-pointer"
                >
                  <span>{slide.secondaryButtonText}</span>
                </Link>
              </div>

              {/* Micro Trust Proof */}
              <div className="pt-2 flex items-center gap-4 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span>Buyer Protection</span>
                </span>
                <span className="flex items-center gap-1">
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                  <span>Top Rated Stores</span>
                </span>
              </div>
            </div>

            {/* Right Product Image Column */}
            <div className="w-full md:w-1/2 flex items-center justify-center md:justify-end relative">
              <div className="relative w-full max-w-[280px] sm:max-w-[340px] md:max-w-[400px] aspect-[4/3] flex items-center justify-center">
                {/* Product Image */}
                <img
                  src={slide.imageSrc}
                  alt={slide.imageAlt}
                  className="relative z-10 w-auto h-auto max-h-[220px] sm:max-h-[280px] md:max-h-[340px] object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.45)] transition-all duration-500 hover:scale-105 select-none"
                  draggable={false}
                />

                {/* Floating Rating Badge */}
                <div className="hidden sm:flex absolute -bottom-2 left-4 z-20 items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/15 text-white shadow-xl">
                  <div className="w-5 h-5 rounded-md bg-amber-400/20 text-amber-300 flex items-center justify-center">
                    <Star size={11} className="fill-amber-300" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] text-slate-400 block leading-tight">
                      {slide.floatingBadgeText}
                    </span>
                    <span className="text-xs font-bold text-white">
                      {slide.floatingBadgeRating} / 5.0
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Carousel Arrows */}
          <button
            type="button"
            onClick={() =>
              setCurrentSlide((prev) =>
                prev === 0 ? slides.length - 1 : prev - 1,
              )
            }
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/50 hover:bg-slate-900/80 text-white items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer border border-white/10 shadow-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/50 hover:bg-slate-900/80 text-white items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer border border-white/10 shadow-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Pagination Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {slides.map((s, index) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === index
                    ? 'w-6 bg-white'
                    : 'w-2 bg-white/30 hover:bg-white/60'
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
