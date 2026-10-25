'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Headphones,
  RotateCcw,
  Sparkles,
  Truck,
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
    kicker: 'Starting from 40$',
    titleLine1: 'The best watch',
    titleLine2: 'Collection 2025',
    discountText: 'Exclusive offer ',
    discountHighlight: '10%',
    discountSuffix: ' off this week',
    buttonText: 'Shop Now',
    buttonLink: '/products',
    imageSrc: '/hero/smartwatch.png',
    imageAlt: 'Smart Watch Collection 2025',
    badge: 'Popular Choice',
    bgGradient: 'from-[#0b2834] via-[#0f3443] to-[#164b5e]',
    accentColor: '#facc15',
  },
  {
    id: 2,
    kicker: 'Wireless & Noise Cancelling',
    titleLine1: 'Premium Audio',
    titleLine2: 'Pro Series 2025',
    discountText: 'Save up to ',
    discountHighlight: '25%',
    discountSuffix: ' on smart wearables',
    buttonText: 'Explore Now',
    buttonLink: '/products',
    imageSrc: '/hero/watch-pair.png',
    imageAlt: 'Dual Smartwatch Edition',
    badge: 'Trending Now',
    bgGradient: 'from-[#0d2f3d] via-[#123e4f] to-[#1b5569]',
    accentColor: '#38bdf8',
  },
];

const features = [
  {
    icon: <Truck className="w-5 h-5 text-blue-600" />,
    title: 'Free Delivery',
    description: 'For all orders over $50',
  },
  {
    icon: <RotateCcw className="w-5 h-5 text-emerald-600" />,
    title: '90 Days Return',
    description: 'If goods have problems',
  },
  {
    icon: <CreditCard className="w-5 h-5 text-indigo-600" />,
    title: 'Secure Payment',
    description: '100% secure payment',
  },
  {
    icon: <Headphones className="w-5 h-5 text-amber-600" />,
    title: '24/7 Support',
    description: 'Dedicated assistance',
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
    <section className="w-full font-poppins pt-4 pb-8">
      <div className="w-[88%] max-w-7xl mx-auto space-y-6">
        {/* Main Hero Banner */}
        <div
          className={`relative w-full rounded-2xl overflow-hidden bg-gradient-to-r ${slide.bgGradient} transition-all duration-700 shadow-xl min-h-[380px] sm:min-h-[440px] md:min-h-[480px] flex items-center group`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 w-full px-6 sm:px-10 md:px-16 py-10 md:py-14 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
            {/* Left Content Column */}
            <div className="w-full md:w-1/2 text-left space-y-4">
              {slide.badge && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-cyan-200 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{slide.badge}</span>
                </div>
              )}

              <p className="text-sm sm:text-base text-gray-200/90 font-medium tracking-wide">
                {slide.kicker}
              </p>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-white tracking-tight leading-[1.12]">
                <span className="block">{slide.titleLine1}</span>
                <span className="block text-white/95 mt-1">
                  {slide.titleLine2}
                </span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-gray-200 font-medium pt-1">
                <span>{slide.discountText}</span>
                <span
                  style={{ color: slide.accentColor }}
                  className="font-bold underline decoration-2 underline-offset-4"
                >
                  {slide.discountHighlight}
                </span>
                <span>{slide.discountSuffix}</span>
              </p>

              <div className="pt-3">
                <Link
                  href={slide.buttonLink}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-white hover:bg-gray-100 text-gray-900 font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-xl active:scale-[0.98] group/btn cursor-pointer"
                >
                  <span>{slide.buttonText}</span>
                  <ArrowRight className="w-4 h-4 text-gray-900 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Visual Image Column */}
            <div className="w-full md:w-1/2 flex items-center justify-center md:justify-end relative">
              <div className="relative w-full max-w-[360px] sm:max-w-[420px] md:max-w-[480px] aspect-[4/3] flex items-center justify-center">
                {/* Glow ring */}
                <div className="absolute inset-0 bg-cyan-400/15 rounded-full blur-2xl transform scale-90 pointer-events-none" />

                <img
                  src={slide.imageSrc}
                  alt={slide.imageAlt}
                  className="relative z-10 w-auto h-auto max-h-[300px] sm:max-h-[360px] md:max-h-[400px] object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.5)] transition-all duration-500 hover:scale-105 select-none"
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
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer border border-white/10 shadow-md"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() =>
              setCurrentSlide((prev) => (prev + 1) % slides.length)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer border border-white/10 shadow-md"
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
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === index
                    ? 'w-7 bg-white'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Feature Badges Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-2">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3.5 p-4 rounded-xl bg-white border border-gray-100 shadow-xs hover:shadow-sm transition-shadow"
            >
              <div className="p-2.5 rounded-lg bg-gray-50 shrink-0">
                {feature.icon}
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-gray-900 truncate">
                  {feature.title}
                </h4>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
