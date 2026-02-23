import React from 'react';

const logos = [
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/partner%20logos/NMPA-Logo-Blue.png",
    alt: "NMPA"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/partner%20logos/aamp%20logo.png",
    alt: "AAMP"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/partner%20logos/csu%20logo.png",
    alt: "CSU"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/partner%20logos/Techstars_Logo_Primary_Black.png",
    alt: "Techstars"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/partner%20logos/iamp%20logo.png",
    alt: "IAMP"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/partner%20logos/impa%20logo.jpg",
    alt: "IMPA"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/partner%20logos/KAMP%20logo%20transparent%20(1).png",
    alt: "KAMP"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/partner%20logos/MAMP-Logo-Color-Black-Web.avif",
    alt: "MAMP"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/partner%20logos/MAMP_logo.jpg",
    alt: "MAMP Alternative"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/partner%20logos/mmpa%20logo.avif",
    alt: "MMPA"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/partner%20logos/PAMP%20logo.png",
    alt: "PAMP"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/partner%20logos/WAMPLogo-lines.png.webp",
    alt: "WAMP"
  }
];

export default function PartnerLogoBanner() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-lg text-stone-600 font-medium">Industry Partners & Associations</p>
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