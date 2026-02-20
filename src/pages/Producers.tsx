import React, { useEffect, useRef } from 'react';
import { Beef, DollarSign, TrendingUp, Calendar, Truck, FileText, Quote } from 'lucide-react';

export default function Producers() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set page title and meta description for SEO
    document.title = 'Livestock Producer Software - Manage Sales & Scheduling | Farmshare';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Streamline your livestock business with Farmshare. Book slaughter dates, track yields, manage inventory, and sell direct-to-consumer. Free for producers.');
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
      <section className="relative py-16 md:py-24 lg:py-36 overflow-hidden">
        <div 
          ref={parallaxRef}
          className="parallax-bg"
          style={{ 
            backgroundImage: 'url(https://images.pexels.com/photos/735968/pexels-photo-735968.jpeg)'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 to-brand-cream/70"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center fade-up">
            <h1 className="text-4xl md:text-5xl lg:text-7xl mb-6 md:mb-8 lg:mb-10 leading-tight text-brand-green font-roca tracking-tight stagger-child">
              Sell Smarter.
              <br />
              Manage Better.
              <br />
              Keep More.
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-stone-600 mb-8 lg:mb-10 font-medium stagger-child">
              Farmshare connects you directly to buyers and your processor—so you can book slots, track yields, manage inventory, and sell shares without the spreadsheet mess. You'll also get access to wholesale opportunities and institutional buyers who value local, traceable meat.
            </p>
            <a 
              href="https://partners.farmshare.co/scheduling"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-orange text-white text-lg px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center font-bold stagger-child"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Find a Processor
            </a>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">

            <div className="space-y-24">
              {/* Feature 1 */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-brand-orange mb-6 flex items-center">
                    <Calendar className="h-6 w-6 mr-2" />
                    Book Slaughter Dates
                  </h3>
                  <p className="text-lg text-stone-700 space-y-4">
                    Reserve harvest slots with your processor in just a few clicks—no more waiting on callbacks or juggling calendars.
                    Farmshare keeps everything organized: select your drop-off date, specify species and head count, and get instant confirmation.
                    You'll receive automatic reminders as your date approaches, plus real-time updates if anything changes.
                    Stay ahead of schedule and in sync with your processor, all from your phone or computer.
                  </p>
                </div>
                <div className="rounded-lg shadow-[0_20px_50px_rgba(0,111,53,0.2)] overflow-hidden">
                  <video 
                    className="w-full h-[300px] object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster=""
                  >
                    <source src="https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/demo%20videos/for%20producers%20v2%20.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 rounded-lg shadow-[0_20px_50px_rgba(0,111,53,0.2)] overflow-hidden">
                  <video 
                    className="w-full h-[300px] object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="none"
                    loading="lazy"
                    poster=""
                  >
                    <source src="https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/demo%20videos/producer%20track%20yields%20and%20iventory.mp4" type="video/mp4" />
                  </video>
                </div>
                <div className="order-1 md:order-2">
                  <h3 className="text-2xl font-bold text-brand-orange mb-6 flex items-center">
                    <FileText className="h-6 w-6 mr-2" />
                    Track Yields & Inventory
                  </h3>
                  <p className="text-lg text-stone-700 space-y-4">
                    Get full visibility into your product—from carcass to cut.
                    Monitor hanging weights, trim, and packaged inventory for every animal you process, all tied directly to your processor jobs.
                    Easily compare yields across species or dates, spot discrepancies, and know exactly how much product you have available to sell.
                    Whether you're managing freezer shares or preparing for wholesale, Farmshare keeps your inventory organized and actionable.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-brand-orange mb-6 flex items-center">
                    <Truck className="h-6 w-6 mr-2" />
                    Sell Direct-to-Consumer
                  </h3>
                  <p className="text-lg text-stone-700 space-y-4">
                    Easily manage bulk meat sales without the spreadsheet chaos.
                    Send digital cut sheets, collect buyer details, and assign customers to specific animals—all from one place.
                    Whether you're selling halves, quarters, or whole animals, Farmshare keeps everything organized, from deposit to delivery.
                    Track each buyer's preferences, weights, and share breakdowns—so you can focus on raising great meat, not chasing down paperwork.
                  </p>
                </div>
                <div className="rounded-lg shadow-[0_20px_50px_rgba(0,111,53,0.2)] overflow-hidden">
                  <video 
                    className="w-full h-[300px] object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="none"
                    loading="lazy"
                    poster=""
                  >
                    <source src="https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/demo%20videos/producers%20sell%20to%20customers.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
            </div>

            {/* Coming Soon */}
            <div className="mt-24 bg-brand-cream rounded-lg p-12">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-bold text-brand-green mb-6">Coming Soon: Wholesale Marketplace</h3>
                  <p className="text-lg text-stone-700 mb-8">Soon you'll be able to sell to schools, restaurants, and grocers through Farmshare's wholesale platform.</p>
                  <a 
                    href="https://meetings.hubspot.com/henry-arrowood/quad-p-demo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-brand-green text-white px-6 py-3 rounded-lg hover:bg-brand-green/90 transition-colors inline-flex items-center font-bold"
                  >
                    Join the Waitlist
                  </a>
                </div>
                <div className="rounded-lg shadow-[0_20px_50px_rgba(0,111,53,0.2)] overflow-hidden">
                  <video 
                    className="w-full h-[300px] object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="none"
                    loading="lazy"
                    poster=""
                  >
                    <source src="https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content//producer%20overview.mp4" type="video/mp4" />
                  </video>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-brand-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-roca text-brand-green text-center mb-16">Built with Ranchers, for Ranchers</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <Quote className="h-8 w-8 text-brand-orange mb-6" />
                <p className="text-lg text-stone-700 mb-8">
                  "With Farmshare, we finally got out of the spreadsheet mess. I know where every cut is going and I don't waste time chasing my processor."
                </p>
                <div className="flex items-center">
                  <img 
                    src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face" 
                    alt="Maria Rodriguez" 
                    className="w-12 h-12 rounded-full object-cover mr-4 bg-brand-cream"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div>
                    <p className="font-bold text-brand-green">Maria Rodriguez</p>
                    <p className="text-stone-600">Sunset Ranch, Texas</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <Quote className="h-8 w-8 text-brand-orange mb-6" />
                <p className="text-lg text-stone-700 mb-8">
                  "The scheduling and inventory tracking has transformed how we manage our direct-to-consumer program. It's a game-changer."
                </p>
                <div className="flex items-center">
                  <img 
                    src="https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content//cowboy.jpg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face" 
                    alt="Jake Williams" 
                    className="w-12 h-12 rounded-full object-cover mr-4 bg-brand-cream"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div>
                    <p className="font-bold text-brand-green">Jake Williams</p>
                    <p className="text-stone-600">Mountain View Cattle Co., Montana</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-roca text-brand-green mb-8">Take Back Control of Your Meat Business</h2>
            <div className="flex flex-col md:flex-row gap-6 justify-center mb-8">
              <a 
                href="https://partners.farmshare.co/scheduling"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-orange text-white px-8 py-4 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center justify-center font-bold"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Find a Processor
              </a>
              <a 
                href="https://meetings.hubspot.com/henry-arrowood/quad-p-demo"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-green text-white px-8 py-4 rounded-lg hover:bg-brand-green/90 transition-colors inline-flex items-center justify-center font-bold"
              >
                Join the Wholesale Waitlist
              </a>
            </div>
            <p className="text-lg text-stone-600">
              Farmshare is free for producers. No spreadsheets. No guesswork. Just better meat marketing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}