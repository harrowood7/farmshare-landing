import React from 'react';
import { useParallaxScroll } from '../hooks/useParallaxScroll';

interface HeroSectionProps {
  title: string;
  description: string;
  backgroundImage: string;
  children?: React.ReactNode;
}

export default function HeroSection({ title, description, backgroundImage, children }: HeroSectionProps) {
  const parallaxRef = useParallaxScroll();

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div 
        ref={parallaxRef}
        className="parallax-bg"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/70 to-brand-cream/70" />
      <div className="container mx-auto px-4 relative">
        <div className="max-w-3xl mx-auto text-center fade-up">
          <h1 className="text-4xl md:text-5xl lg:text-7xl mb-4 md:mb-6 lg:mb-8 leading-tight text-brand-green font-roca tracking-tight stagger-child">
            {title}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-stone-600 mb-6 lg:mb-8 font-medium stagger-child">
            {description}
          </p>
          {children}
        </div>
      </div>
    </section>
  );
}