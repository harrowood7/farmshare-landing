import React from 'react';
import { processors } from '../data/processors';

// Build logos from processors data (source of truth), skipping nulls and deduplicating by URL
const seen = new Set<string>();
const logos = processors.reduce<{ src: string; alt: string }[]>((acc, p) => {
  if (p.logo && !seen.has(p.logo)) {
    seen.add(p.logo);
    acc.push({ src: p.logo, alt: p.name });
  }
  return acc;
}, []);

export default function LogoBanner() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-lg text-stone-600 font-medium">Trusted by Independent Processors Nationwide</p>
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="flex logo-slide">
            {[...logos, ...logos].map((logo, index) => (
              <div 
                key={index} 
                className="flex-none w-[200px] h-32 flex items-center justify-center px-8"
              >
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all duration-300 transform hover:scale-110"
                    loading="lazy"
                    decoding="async"
                    style={{ padding: '8px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}