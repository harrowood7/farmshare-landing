import React from 'react';
import { Quote } from 'lucide-react';
import { TestimonialProps } from '../../types';

export default function Testimonial({ quote, author, company, image }: TestimonialProps) {
  return (
    <div className="bg-brand-cream p-6 rounded-lg shadow-lg">
      <Quote className="h-8 w-8 text-brand-orange mb-4" />
      <p className="text-lg text-stone-700 mb-6">{quote}</p>
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-lg bg-brand-cream flex items-center justify-center overflow-hidden p-1 mr-4">
          <img
            src={image}
            alt={company}
            className="max-w-full max-h-full object-contain"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.className = "w-12 h-12 rounded-lg bg-brand-green flex items-center justify-center mr-4";
                parent.innerHTML = `<span class="text-white font-bold text-lg">${company.split(' ').map(w => w[0]).filter(c => c && c.match(/[A-Z0-9]/i)).slice(0, 2).join('').toUpperCase()}</span>`;
              }
            }}
          />
        </div>
        <div>
          <p className="font-bold text-brand-green">{author}</p>
          <p className="text-stone-600">{company}</p>
        </div>
      </div>
    </div>
  );
}