import React, { useEffect, useRef } from 'react';
import { ShoppingCart, Truck, FileText, Calendar, Building2, Search, Globe, UtensilsCrossed, GraduationCap, Store, Beef } from 'lucide-react';

export default function Buyers() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set page title and meta description for SEO
    document.title = 'Local Meat Sourcing Platform for Restaurants & Institutions | Farmshare';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Source traceable, high-quality meat directly from independent producers. Perfect for restaurants, schools, grocers, and institutions seeking local meat suppliers.');
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-up').forEach(element => {
      observer.observe(element);
    });

    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.scrollY;
        parallaxRef.current.style.transform = `translate3d(0, ${scrolled * 0.5}px, 0)`;
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-36 overflow-hidden">
        <div 
          ref={parallaxRef}
          className="parallax-bg"
          style={{ 
            backgroundImage: 'url(https://images.pexels.com/photos/1927377/pexels-photo-1927377.jpeg)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 to-brand-cream/70" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center fade-up">
            <h1 className="text-4xl md:text-5xl lg:text-7xl mb-6 md:mb-8 lg:mb-10 leading-tight text-brand-green font-roca tracking-tight stagger-child">
              Source Better Meat—Straight from the Ranch
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-stone-600 mb-8 lg:mb-10 font-medium stagger-child">
              Connect with independent producers and local processors to get high-quality, fully traceable meat. No middlemen, no mystery—just real relationships and unmatched transparency from farm to cut.
            </p>
            <a 
              href="https://meetings.hubspot.com/henry-arrowood/quad-p-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-orange text-white text-lg px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center font-bold stagger-child"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Join Waitlist
            </a>
          </div>
        </div>
      </section>

      {/* Why Farmshare + Video */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-roca text-brand-green text-center mb-16">Better meat. Better sourcing.</h2>
            <div className="grid md:grid-cols-4 gap-12 mb-16">
              <div className="text-center">
                <div className="mb-6">
                  <ShoppingCart className="h-12 w-12 text-brand-orange mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-brand-green mb-4">Traceable Sourcing</h3>
                <p className="text-stone-700">Every cut is tied to a producer, processor, and harvest date</p>
              </div>
              <div className="text-center">
                <div className="mb-6">
                  <Building2 className="h-12 w-12 text-brand-orange mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-brand-green mb-4">Institutional Scale</h3>
                <p className="text-stone-700">Buy by the cut, primal, or carcass—at volume</p>
              </div>
              <div className="text-center">
                <div className="mb-6">
                  <Search className="h-12 w-12 text-brand-orange mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-brand-green mb-4">Unmatched Transparency</h3>
                <p className="text-stone-700">Full visibility into origin, practices, and certifications</p>
              </div>
              <div className="text-center">
                <div className="mb-6">
                  <Globe className="h-12 w-12 text-brand-orange mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-brand-green mb-4">Support Local Supply</h3>
                <p className="text-stone-700">Keep your dollars in regional agriculture and shorten your food miles</p>
              </div>
            </div>
            <div className="rounded-lg shadow-[0_20px_50px_rgba(0,111,53,0.2)] overflow-hidden">
              <video 
                className="w-full h-[300px] md:h-[400px] lg:h-[500px] object-cover"
                autoPlay
                muted
                loop
                playsInline
                disablePictureInPicture
                disableRemotePlayback
                preload="metadata"
                poster=""
              >
                <source 
                  src="https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content//buyer%20flow.mp4" 
                  type="video/mp4" 
                />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-brand-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-roca text-brand-green text-center mb-16">From ranch to table in three steps.</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="bg-white p-8 rounded-lg shadow-lg text-center transform hover:-translate-y-1 transition-transform duration-300">
                <div className="mb-6">
                  <FileText className="h-12 w-12 text-brand-orange mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-brand-green mb-4">Tell Us What You Need</h3>
                <p className="text-stone-700">You submit your spec—cut, volume, frequency, quality preferences</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg text-center transform hover:-translate-y-1 transition-transform duration-300">
                <div className="mb-6">
                  <ShoppingCart className="h-12 w-12 text-brand-orange mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-brand-green mb-4">We Match You with Supply</h3>
                <p className="text-stone-700">Farmshare aggregates from independent producers and coordinates with local processors</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg text-center transform hover:-translate-y-1 transition-transform duration-300">
                <div className="mb-6">
                  <Truck className="h-12 w-12 text-brand-orange mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-brand-green mb-4">Get High-Quality Meat, Delivered</h3>
                <p className="text-stone-700">Your order is cut to spec and delivered on your timeline</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-roca text-brand-green text-center mb-16">Meet Your New Meat Source</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div className="bg-brand-orange p-8 rounded-lg text-center transform hover:-translate-y-1 transition-transform duration-300">
                <UtensilsCrossed className="h-12 w-12 text-white mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-white">Restaurants</h3>
              </div>
              <div className="bg-brand-green p-8 rounded-lg text-center transform hover:-translate-y-1 transition-transform duration-300">
                <GraduationCap className="h-12 w-12 text-white mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-white">Schools & Institutions</h3>
              </div>
              <div className="bg-brand-yellow p-8 rounded-lg text-center transform hover:-translate-y-1 transition-transform duration-300">
                <Store className="h-12 w-12 text-white mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-white">Retail & Grocers</h3>
              </div>
              <div className="bg-[#8B4513] p-8 rounded-lg text-center transform hover:-translate-y-1 transition-transform duration-300">
                <Beef className="h-12 w-12 text-white mb-4 mx-auto" />
                <h3 className="text-xl font-bold text-white">Butcher Shops</h3>
              </div>
            </div>
            <p className="text-lg text-stone-700 text-center">
              Farmshare works with buyers who care about product quality, sourcing integrity, and working directly with regional supply chains.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-brand-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-roca text-brand-green mb-6">Be the First to Source with Farmshare</h2>
            <p className="text-xl text-stone-700 mb-8">
              Join our waitlist to get early access to premium local meat—and help shape the future of regional sourcing.
            </p>
            <a 
              href="https://meetings.hubspot.com/henry-arrowood/quad-p-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-orange text-white text-lg px-8 py-4 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center font-bold"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Join Waitlist
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}