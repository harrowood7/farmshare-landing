{/* Move StickyDemoButton.tsx content here */}
import React from 'react';
import { Calendar } from 'lucide-react';
import { useStickyButton } from '../../hooks/useStickyButton';
import { DEMO_URL } from '../../constants';

export default function StickyDemoButton() {
  const showStickyButton = useStickyButton();

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 ${
        showStickyButton ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
      }`}
    >
      <a 
        href={DEMO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-brand-orange text-white px-6 py-3 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center font-bold shadow-lg hover:shadow-xl"
      >
        <Calendar className="mr-2 h-5 w-5" />
        Schedule Demo
      </a>
    </div>
  );
}