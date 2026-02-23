import React from 'react';

const logos = [
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/bringhurst%20logo.png",
    alt: "Bringhurst"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/Gores_Meat_Logo.svg",
    alt: "Gore's Meat"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/heartquist%20hollow%20logo.png",
    alt: "Heartquist Hollow"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/d&d%20logo.png",
    alt: "D&D"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/HPP%20logo.avif",
    alt: "HPP"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/hurdwell-logo.png",
    alt: "Hurdwell"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/johnson's%20logo.webp",
    alt: "Johnson's"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/lone%20crow%20logo%20(1).jpg",
    alt: "Lone Crow"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/Nadler's%20logo.avif",
    alt: "Nadler's"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/renick%20logo%20(1).jpg",
    alt: "Renick"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/rocky%20mountain%20logo%20(1).jpg",
    alt: "Rocky Mountain"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/sunnyside-meats-logo.svg",
    alt: "Sunnyside Meats"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/the%20butchers%20block%20logo%20(1).jpg",
    alt: "The Butcher's Block"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/westcliffe%20logo.avif",
    alt: "Westcliffe"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/willie%20joe's%20logo.webp",
    alt: "Willie Joe's"
  },
  {
    src: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/zk%20logo.avif",
    alt: "ZK"
  }
];

export default function LogoBanner() {
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <p className="text-lg text-stone-600 font-medium">Trusted by 30+ Independent Processors</p>
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