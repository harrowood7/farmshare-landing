import React, { useEffect, useRef } from 'react';
import { Calendar, Mail, Users, Beef, ShoppingCart, Factory } from 'lucide-react';

export default function Mission() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Our Mission - Rebuilding the Meat Supply Chain | Farmshare';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Farmshare is building the operating system for independent meat—starting with processor software and expanding into a connected network of producers, processors, and buyers.');
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
      <section className="relative py-12 md:py-20 lg:py-32 overflow-hidden">
        <div 
          ref={parallaxRef}
          className="parallax-bg"
          style={{ 
            backgroundImage: 'url(/hero-mission.png)'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 to-brand-cream/70"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center fade-up">
            <h1 className="text-4xl md:text-5xl lg:text-7xl mb-4 md:mb-6 lg:mb-8 leading-tight text-brand-green font-roca tracking-tight stagger-child">
              A Better Meat Supply Chain—Built from the Ground Up
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-stone-600 mb-6 lg:mb-8 font-medium stagger-child">
              The industrial system is consolidated, opaque, and extractive. Farmshare exists to change that—starting with the tools processors need today, and building toward a connected network that works for everyone.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-20">
        {/* Who We Are Today */}
        <div className="max-w-3xl mx-auto mb-8 md:mb-12 lg:mb-20">
          <h2 className="text-2xl md:text-3xl font-roca text-brand-orange mb-4 md:mb-6">Making Independent Meat Thrive</h2>
          <div className="space-y-4 md:space-y-6">
            <p className="text-base md:text-xl text-stone-700 leading-relaxed">
              Farmshare's mission is to help independent meat thrive. Today, that starts with the processor—the backbone of the local meat supply chain. We build software that replaces spreadsheets, phone calls, and paper cut sheets with a single platform that saves hours every day. Over 30 processors across the country already run on Farmshare.
            </p>
          </div>
        </div>

        {/* Video */}
        <div className="max-w-3xl mx-auto mb-8 md:mb-12 lg:mb-20">
          <div className="h-[250px] md:h-[350px] lg:h-[450px] rounded-lg shadow-[0_20px_50px_rgba(0,111,53,0.2)] overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/XtJwE05TqHE"
              title="Farmshare Overview"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>

        {/* Our Values */}
        <div className="max-w-3xl mx-auto mb-8 md:mb-12 lg:mb-20">
          <h2 className="text-2xl md:text-3xl font-roca text-brand-orange mb-4 md:mb-6">Our Values</h2>
          <div className="space-y-3 md:space-y-4">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
              <h3 className="text-lg md:text-xl font-bold text-brand-green mb-2">Transparency</h3>
              <p className="text-sm md:text-base text-stone-700">We believe in complete transparency across the supply chain, from ranch to plate.</p>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
              <h3 className="text-lg md:text-xl font-bold text-brand-green mb-2">Fair Value Distribution</h3>
              <p className="text-sm md:text-base text-stone-700">Our system ensures that producers and processors receive their fair share of the final product value.</p>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
              <h3 className="text-lg md:text-xl font-bold text-brand-green mb-2">Innovation</h3>
              <p className="text-sm md:text-base text-stone-700">We leverage technology to solve real-world problems experienced every day in the meat industry.</p>
            </div>
          </div>
        </div>

        {/* Where We're Going */}
        <div className="max-w-4xl mx-auto mb-8 md:mb-12 lg:mb-20">
          <h2 className="text-2xl md:text-3xl font-roca text-brand-orange mb-4 md:mb-6 text-center">Where We're Going</h2>
          <p className="text-base md:text-xl text-stone-700 leading-relaxed text-center mb-12 max-w-3xl mx-auto">
            Farmshare is more than scheduling software. We're building the operating system for independent meat—a connected network where processors, producers, and buyers all benefit from better tools and shorter supply chains.
          </p>

          <div className="space-y-6">
            {/* Stage 1 — Now */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg fade-up">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12 bg-brand-green rounded-full flex items-center justify-center">
                  <Factory className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-brand-green">Processor Platform</h3>
                    <span className="bg-brand-green/10 text-brand-green font-bold px-3 py-0.5 rounded-full text-xs uppercase tracking-wide">Live Now</span>
                  </div>
                  <p className="text-stone-700">
                    Scheduling, cut sheets, customer messaging, invoicing, and job tracking—built for how plants actually run. Used by 30+ processors nationwide, saving 5+ hours per day.
                  </p>
                </div>
              </div>
            </div>

            {/* Stage 2 — Building */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg fade-up">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12 bg-brand-orange rounded-full flex items-center justify-center">
                  <Beef className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-brand-green">Producer Tools</h3>
                    <span className="bg-brand-orange/10 text-brand-orange font-bold px-3 py-0.5 rounded-full text-xs uppercase tracking-wide">Expanding</span>
                  </div>
                  <p className="text-stone-700">
                    Producers already book slots, submit cut sheets, and get text updates through their processor's Farmshare portal—free. We're expanding with yield tracking, inventory management, and direct-to-consumer sales tools so ranchers can manage their entire meat business from one place.
                  </p>
                </div>
              </div>
            </div>

            {/* Stage 3 — Coming */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg fade-up">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12 bg-brand-yellow rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-brand-green">Wholesale Marketplace</h3>
                    <span className="bg-brand-yellow/10 text-brand-yellow font-bold px-3 py-0.5 rounded-full text-xs uppercase tracking-wide">Coming Soon</span>
                  </div>
                  <p className="text-stone-700">
                    The long-term vision: a wholesale marketplace connecting restaurants, schools, grocers, and institutions directly to regional producers and processors. Fully traceable sourcing, coordinated logistics, and shorter supply chains—eliminating the middlemen that extract value from both ends.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-roca text-brand-green mb-6">
              Believe in the Future of Local Meat? Join Us.
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <a 
              href="https://meetings.hubspot.com/henry-arrowood/quad-p-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-green text-white p-6 rounded-lg hover:bg-brand-green/90 transition-colors text-center group transform hover:-translate-y-1 duration-300"
            >
              <div className="mb-3">
                <Calendar className="h-8 w-8 mx-auto group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-bold mb-2">Schedule a Demo</h3>
              <p className="text-brand-cream/90 text-sm">See how Farmshare can transform your operation</p>
            </a>

            <a 
              href="mailto:henry@farmshare.co"
              className="bg-brand-orange text-white p-6 rounded-lg hover:bg-brand-yellow transition-colors text-center group transform hover:-translate-y-1 duration-300"
            >
              <div className="mb-3">
                <Mail className="h-8 w-8 mx-auto group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-bold mb-2">Partner with Farmshare</h3>
              <p className="text-white/90 text-sm">Explore partnership opportunities</p>
            </a>

            <a 
              href="https://db9j5.share.hsforms.com/2nger3sAIT7OL3VHUjHxxWw"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-cream border-2 border-brand-green text-brand-green p-6 rounded-lg hover:bg-brand-green hover:text-white transition-colors text-center group transform hover:-translate-y-1 duration-300"
            >
              <div className="mb-3">
                <Users className="h-8 w-8 mx-auto group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg font-bold mb-2">Refer a Processor or Producer</h3>
              <p className="group-hover:text-white/90 transition-colors text-sm">Help grow the network</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
