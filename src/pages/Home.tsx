import React, { useEffect, useRef, useState } from 'react';
import { Factory, ShoppingCart, Users, Calendar, Linkedin, Mail, Phone, Beef } from 'lucide-react';
import { Link } from 'react-router-dom';
import PartnerLogoBanner from '../components/PartnerLogoBanner';

export default function Home() {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [showStickyButton, setShowStickyButton] = useState(false);

  useEffect(() => {
    // Set page title and meta description for SEO
    document.title = 'Farmshare - Modern Software for Independent Meat Processors & Producers';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Streamline harvest scheduling, cut sheets, inventory, and sales with Farmshare\'s connected platform. Built for independent processors, producers, and buyers in the meat supply chain.');
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
      
      setShowStickyButton(window.scrollY > window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {/* Sticky Demo Button */}
      <div 
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 ${
          showStickyButton ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
      >
        <a 
          href="https://meetings.hubspot.com/henry-arrowood/quad-p-demo"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-brand-orange text-white px-6 py-3 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center font-bold shadow-lg hover:shadow-xl"
        >
          <Calendar className="mr-2 h-5 w-5" />
          Schedule Demo
        </a>
      </div>

      {/* Hero */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div 
          ref={parallaxRef}
          className="parallax-bg"
          style={{ 
            backgroundImage: 'url(https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content//cattle.webp)'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 to-brand-cream/70"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center fade-up">
            <h1 className="text-5xl md:text-6xl lg:text-7xl mb-8 leading-tight text-brand-green font-roca tracking-tight stagger-child">
              The Meat Supply Chain, Rebuilt for the People Who Power It
            </h1>
            <p className="text-xl md:text-2xl text-stone-600 mb-8 font-medium stagger-child">
              Farmshare is modern software for independent processors and producers—streamlining harvest scheduling, cut sheets, inventory, and sales in one connected platform. Less chaos. More control. Built for how meat actually moves.
            </p>
            <a 
              href="https://meetings.hubspot.com/henry-arrowood/quad-p-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-orange text-white text-lg px-8 py-4 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center font-bold stagger-child"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Schedule a Demo
            </a>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto fade-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative max-w-sm mx-auto">
                <img 
                  src="https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content//Untitled%20design.png"
                  alt="Farmshare Mission Illustration"
                  className="w-full h-auto"
                />
              </div>
              <div>
                <h2 className="text-4xl font-roca mb-6 text-brand-green stagger-child">Our Mission</h2>
                <p className="text-xl text-stone-700 leading-relaxed stagger-child">
                  Farmshare's mission is to help independent meat thrive. We're building a decentralized supply chain where producers and processors keep more value—cutting out middlemen with software that's tough, practical, and built for the real world. From ranch to plate, we're here to flip the script.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Processors */}
      <section id="processors" className="py-20 bg-brand-cream">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 items-center gap-8">
            <div className="fade-up">
              <div className="flex items-center space-x-4 mb-6 stagger-child">
                <Factory className="h-8 w-8 text-brand-green" />
                <h2 className="text-4xl font-roca text-brand-green">For Processors</h2>
              </div>
              <h3 className="text-3xl font-roca text-brand-orange mb-4 stagger-child">Run Smoother, Book Faster</h3>
              <p className="text-xl text-stone-700 leading-relaxed mb-6 stagger-child">
                Cut hours of admin every day—auto-schedule harvests, collect cut sheets, and send text updates, all from one dashboard. Farmshare helps you fill your calendar fast, reduce no-shows, and boost plant throughput without the paperwork pileup.
              </p>
              <Link 
                to="/processors"
                className="text-brand-orange hover:text-brand-yellow transition-colors inline-flex items-center font-bold text-lg"
              >
                Learn More
                <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
            <div className="rounded-lg shadow-[0_20px_50px_rgba(0,111,53,0.2)] overflow-hidden fade-up">
              <video 
                className="w-full h-full object-cover"
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
                  src="https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/demo%20videos/scheduling%20and%20capacity%20v2.mp4" 
                  type="video/mp4" 
                />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Producers */}
      <section id="producers" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 items-center gap-8">
            <div className="order-2 md:order-1 rounded-lg shadow-[0_20px_50px_rgba(0,111,53,0.2)] overflow-hidden fade-up">
              <video 
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                disablePictureInPicture
                disableRemotePlayback
                preload="none"
                loading="lazy"
                poster=""
              >
                <source 
                  src="https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/demo%20videos/for%20producers%20v2%20.mp4" 
                  type="video/mp4" 
                />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="order-1 md:order-2 fade-up">
              <div className="flex items-center space-x-4 mb-6 stagger-child">
                <Beef className="h-8 w-8 text-brand-green" />
                <h2 className="text-4xl font-roca text-brand-green">For Producers</h2>
              </div>
              <h3 className="text-3xl font-roca text-brand-orange mb-4 stagger-child">More Markets, More Control</h3>
              <p className="text-xl text-stone-700 leading-relaxed mb-6 stagger-child">
                Sell directly to wholesale markets—and manage everything from processor bookings to cut sheets and inventory tracking in one place. Farmshare connects you to demand, streamlines communication with your processor, and simplifies selling meat.
              </p>
              <Link 
                to="/producers"
                className="text-brand-orange hover:text-brand-yellow transition-colors inline-flex items-center font-bold text-lg"
              >
                Learn More
                <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Buyers */}
      <section id="buyers" className="py-20 bg-brand-cream">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 items-center gap-8">
            <div className="fade-up">
              <div className="flex items-center space-x-4 mb-6 stagger-child">
                <ShoppingCart className="h-8 w-8 text-brand-green" />
                <h2 className="text-4xl font-roca text-brand-green">For Buyers</h2>
              </div>
              <h3 className="text-3xl font-roca text-brand-orange mb-4 stagger-child">Local Meat, Your Way</h3>
              <p className="text-xl text-stone-700 leading-relaxed mb-6 stagger-child">
                Source traceable, high-quality meat straight from independent producers—processed with care by trusted regional partners. Farmshare connects you to value-added, differentiated products you won't find in the industrial supply chain, with full transparency from farm to cut.
              </p>
              <Link 
                to="/buyers"
                className="text-brand-orange hover:text-brand-yellow transition-colors inline-flex items-center font-bold text-lg"
              >
                Learn More
                <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
            <div className="rounded-lg shadow-[0_20px_50px_rgba(0,111,53,0.2)] overflow-hidden fade-up">
              <video 
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                disablePictureInPicture
                disableRemotePlayback
                preload="none"
                loading="lazy"
                poster=""
              >
                <source 
                  src="https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content//producer%20overview.mp4" 
                  type="video/mp4" 
                />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      <PartnerLogoBanner />
    </>
  );
}