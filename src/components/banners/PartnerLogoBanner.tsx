{/* Move PartnerLogoBanner.tsx content here */}
import React from 'react';
import { PARTNER_LOGOS } from '../../constants';

export default function PartnerLogoBanner() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-lg text-stone-600 font-medium">In Partnership With</p>
        </div>
        <div className="relative w-full overflow-hidden">
          <div className="flex logo-slide">
            {[...PARTNER_LOGOS, ...PARTNER_LOGOS].map((logo, index) => (
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