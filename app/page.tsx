'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  const modules = [
    {
      title: 'Smart Garbage',
      subtitle: 'GCS PORTAL',
      desc: 'Verify routes, QR checks & receipts.',
      image: '/garbage-illust.png',
      href: '/garbage',
      gradient: 'from-[#059669] to-[#047857]', // Emerald/Teal
      glow: 'shadow-emerald-950/40 border-emerald-400/20'
    },
    {
      title: 'Service Hub',
      subtitle: 'LOCAL DIRECTORY',
      desc: 'Find verified local technicians.',
      image: '/service-illust.png',
      href: '/service-hub',
      gradient: 'from-[#3B82F6] to-[#1D4ED8]', // Sky/Blue
      glow: 'shadow-blue-950/40 border-blue-400/20'
    },
    {
      title: 'Welfare Assistant',
      subtitle: 'SMART ADVISOR',
      desc: 'Check eligibility for welfare schemes.',
      image: '/welfare-illust-.png',
      href: '/welfare',
      gradient: 'from-[#8B5CF6] to-[#6D28D9]', // Purple/Indigo
      glow: 'shadow-purple-950/40 border-purple-400/20'
    },
    {
      title: 'Citizen Complaints',
      subtitle: 'TRACKING PANEL',
      desc: 'File grievances and track timelines.',
      image: '/citizen-illust.png',
      href: '/complaints',
      gradient: 'from-[#EF4444] to-[#B91C1C]', // Coral/Red
      glow: 'shadow-red-950/40 border-red-400/20'
    }
  ];

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % modules.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + modules.length) % modules.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStart.current - touchEnd.current;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      prevSlide();
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // GSAP animation logic on active card index change
  useEffect(() => {
    if (!mounted || !trackRef.current) return;

    const cards = trackRef.current.children;
    if (cards.length === 0) return;

    const cardWidth = 310; // Match CSS class w-[310px]
    const gap = 16;        // Match tailwind space-x-4 (16px)
    const containerWidth = containerRef.current?.clientWidth || 360;
    
    // Calculate translate offset to perfectly center the active card
    const offset = (containerWidth - cardWidth) / 2;
    const xTranslate = -activeIndex * (cardWidth + gap) + offset;

    // Slide track to show active card
    gsap.to(trackRef.current, {
      x: xTranslate,
      duration: 0.6,
      ease: 'power3.out',
    });

    // Handle scaling and opacity transitions of cards
    Array.from(cards).forEach((card, idx) => {
      const isActive = idx === activeIndex;
      gsap.to(card, {
        scale: isActive ? 1 : 0.9,
        opacity: isActive ? 1 : 0.45,
        duration: 0.6,
        ease: 'power3.out',
      });
    });
  }, [activeIndex, mounted]);

  // Window resize handler to maintain card centering
  useEffect(() => {
    if (!mounted) return;

    const handleResize = () => {
      if (!trackRef.current) return;
      const cardWidth = 310;
      const gap = 16;
      const containerWidth = containerRef.current?.clientWidth || 360;
      const offset = (containerWidth - cardWidth) / 2;
      const xTranslate = -activeIndex * (cardWidth + gap) + offset;
      
      gsap.set(trackRef.current, { x: xTranslate });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeIndex, mounted]);

  return (
    <div className="flex-1 flex flex-col justify-between py-2">
      {/* Top Logo Container (Pushed to the top and made larger) */}
      <div className="flex justify-center pt-3 pb-2 select-none">
        <img src="/logo.webp" alt="Smart Village Logo" className="h-20 w-auto object-contain" />
      </div>

      {/* Vertically Centered Wrapper to Group Welcome Text, Card Carousel and Faint Label */}
      <div className="my-auto w-full flex flex-col">
        
        {/* Hero Welcome Box (Centered & Oversized & Spans End-to-End) */}
        <div className="mb-4 flex flex-col items-center text-center w-full">
          <h2 className="text-4xl font-medium tracking-tight leading-[1.05] uppercase w-full flex flex-col items-center">
            <span 
              className="bg-clip-text text-transparent inline-block pb-0.5"
              style={{
                backgroundImage: 'linear-gradient(to top, #0F6441 0%, #16A34A 15%, #0F172A 40%, #0F172A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Welcome to the
            </span>
            <span 
              className="bg-clip-text text-transparent inline-block"
              style={{
                backgroundImage: 'linear-gradient(to top, #0F6441 10%, #16A34A 25%, #0F172A 76%, #0F172A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Smart Village.
            </span>
          </h2>
        </div>

        {/* GSAP Carousel Slider Container */}
        <div 
          ref={containerRef}
          className={`relative w-full overflow-hidden py-3 cursor-grab active:cursor-grabbing select-none transition-opacity duration-300 ${mounted ? 'opacity-100' : 'opacity-0'}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            ref={trackRef}
            className="flex space-x-4 w-max"
            style={{ transform: 'translateX(0px)' }}
          >
            {modules.map((m, idx) => {
              const isActive = idx === activeIndex;
              return (
                <Link
                  key={idx}
                  href={m.href}
                  className={`relative block w-[310px] h-[340px] rounded-[28px] bg-gradient-to-br ${m.gradient} ${m.glow} border shadow-xl overflow-hidden p-6 flex flex-col justify-between group transition-all duration-300`}
                  onClick={(e) => {
                    // If card is not active, activate it instead of navigating
                    if (!isActive) {
                      e.preventDefault();
                      setActiveIndex(idx);
                    }
                  }}
                >
                  {/* Concentric Circles Ripple Pattern */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[28px]">
                    <div className="absolute -bottom-[24px] -right-[24px] w-[160px] h-[160px] rounded-full bg-white/[0.03]" />
                    <div className="absolute -bottom-[64px] -right-[64px] w-[240px] h-[240px] rounded-full bg-white/[0.03]" />
                    <div className="absolute -bottom-[104px] -right-[104px] w-[320px] h-[320px] rounded-full bg-white/[0.03]" />
                    <div className="absolute -bottom-[144px] -right-[144px] w-[400px] h-[400px] rounded-full bg-white/[0.03]" />
                  </div>

                  {/* Card Main Layout */}
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    {/* Top Group: Title, Subtitle, and Description (Pushed to the top together) */}
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-[10px] font-medium tracking-widest text-white/70">
                          {m.subtitle}
                        </p>
                        <h3 className="text-4xl font-medium tracking-tight text-white leading-tight">
                          {m.title}
                        </h3>
                      </div>
                      <p className="text-xs font-light text-white/90 leading-relaxed max-w-[220px]">
                        {m.desc}
                      </p>
                    </div>

                    {/* Bottom Right: Image Illustration */}
                    <div className="absolute bottom-0 right-0 w-32 h-32 rounded-tl-[36px] overflow-hidden border-t border-l border-white/20 shadow-lg group-hover:scale-[1.03] transition-transform duration-300">
                      <img 
                        src={m.image} 
                        alt={m.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Bottom Left: Navigation CTA */}
                    <div className="flex items-center gap-1 text-[11px] font-medium text-white/90">
                      <span>Open Module</span>
                      <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Instruction label (Faint & Centered, Standard case, Tight spacing) */}
        <div className="text-center mt-2 select-none">
          <span className="text-xs font-light text-brand-text-muted/40">
            Select a module
          </span>
        </div>
      </div>

      {/* Slider Navigation & Indicators (Anchored at the bottom) */}
      <div className="flex items-center justify-between px-6 mt-2 mb-2">
        <button
          onClick={prevSlide}
          className="flex items-center justify-center w-11 h-11 rounded-full border border-[#0F6441]/20 bg-brand-surface-alt text-[#0F6441] hover:bg-brand-surface transition-all active:scale-95 duration-100 shadow-sm"
          aria-label="Previous Slide"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex space-x-2">
          {modules.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'w-6 bg-[#0F6441]' : 'w-2 bg-brand-text-muted/30'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="flex items-center justify-center w-11 h-11 rounded-full border border-[#0F6441]/20 bg-brand-surface-alt text-[#0F6441] hover:bg-brand-surface transition-all active:scale-95 duration-100 shadow-sm"
          aria-label="Next Slide"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
