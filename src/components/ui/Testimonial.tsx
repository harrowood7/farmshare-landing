import React from 'react';
import { Quote } from 'lucide-react';
import { TestimonialProps } from '../../types';

export default function Testimonial({ quote, author, company, image }: TestimonialProps) {
  return (
    <div className="bg-brand-cream p-6 rounded-lg shadow-lg">
      <Quote className="h-8 w-8 text-brand-orange mb-4" />
      <p className="text-lg text-stone-700 mb-6">{quote}</p>
      <div className="flex items-center">
        <img 
          src={image}
          alt={author}
          className="w-12 h-12 rounded-full object-cover mr-4 bg-brand-cream testimonial-avatar"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face';
          }}
        />
        <div>
          <p className="font-bold text-brand-green">{author}</p>
          <p className="text-stone-600">{company}</p>
        </div>
      </div>
    </div>
  );
}