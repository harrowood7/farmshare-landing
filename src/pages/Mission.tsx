import React, { useEffect, useRef } from 'react';
import { Calendar, Mail, Users, Factory, Link2, ShoppingCart, BarChart3 } from 'lucide-react';

export default function Mission() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Our Mission - The Operating System for Independent Meat | Farmshare';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Four companies control 85% of beef processing in America. Their advantage isn\'t quality—it\'s coordination. Farmshare is building the infrastructure that lets independent processors compete.');
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
      {/* Hero */}
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
              Independent Meat Is Better. It Should Win.
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-stone-600 mb-6 lg:mb-8 font-medium stagger-child">
              Four companies control 85% of beef processing in America. Their advantage isn't quality—it's coordination. Farmshare is building the infrastructure that lets independent processors compete together.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12 lg:py-20">

        {/* The Problem */}
        <div className="max-w-3xl mx-auto mb-8 md:mb-12 lg:mb-20">
          <h2 className="text-2xl md:text-3xl font-roca text-brand-orange mb-4 md:mb-6">The Problem</h2>
          <div className="space-y-4 md:space-y-6">
            <p className="text-base md:text-xl text-stone-700 leading-relaxed">
              The industrial meat system is built on logistics, not quality. The largest packers don't dominate because they produce better meat—they dominate because they can coordinate supply, processing, and distribution at scale. Independent processors produce the higher-quality, traceable, locally-raised product that consumers increasingly want. But they're running on paper, spreadsheets, and software from 20 years ago. They can't coordinate. They can't compete.
            </p>
            <p className="text-base md:text-xl text-stone-700 leading-relaxed">
              Meanwhile, the tailwinds have never been stronger. Consumer demand for local and traceable meat is surging. USDA grants are funding new independent capacity. State inspection reciprocity is expanding. Over 3,000 independent processors serve this demand—but they're fragmented, disconnected, and running blind.
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

        {/* What We Believe */}
        <div className="max-w-3xl mx-auto mb-8 md:mb-12 lg:mb-20">
          <h2 className="text-2xl md:text-3xl font-roca text-brand-orange mb-4 md:mb-6">What We Believe</h2>
          <div className="space-y-3 md:space-y-4">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
              <h3 className="text-lg md:text-xl font-bold text-brand-green mb-2">The Network Wins</h3>
              <p className="text-sm md:text-base text-stone-700">One independent processor can't supply a restaurant chain. Fifty processors on a shared platform can. The future of independent meat isn't each plant fighting alone—it's a connected network where processors are more powerful together than they could ever be apart.</p>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
              <h3 className="text-lg md:text-xl font-bold text-brand-green mb-2">Revenue Over Cost Cutting</h3>
              <p className="text-sm md:text-base text-stone-700">The industry obsesses over shaving pennies off processing costs. But the real leverage is on the revenue side—filling your calendar, reducing no-shows, balancing the carcass, getting better prices for every cut. A 5% improvement in how you sell is worth 10x more than a 5% improvement in how you cut.</p>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
              <h3 className="text-lg md:text-xl font-bold text-brand-green mb-2">Start Where It Hurts</h3>
              <p className="text-sm md:text-base text-stone-700">We didn't start by building a marketplace. We started by solving the most painful daily problem: scheduling. Earn trust with a tool that saves hours every day, then build the connective tissue between processors, producers, and buyers. The wedge earns the right to build the network.</p>
            </div>
          </div>
        </div>

        {/* Where We're Going */}
        <div className="max-w-4xl mx-auto mb-8 md:mb-12 lg:mb-20">
          <h2 className="text-2xl md:text-3xl font-roca text-brand-orange mb-4 md:mb-6 text-center">Where We're Going</h2>
          <p className="text-base md:text-xl text-stone-700 leading-relaxed text-center mb-12 max-w-3xl mx-auto">
            Farmshare is building the operating system for independent meat. Each stage adds participants to the network, funds the next, and compounds the advantage. The scheduling wedge got us in the door. The network keeps us in the room. The marketplace owns the room.
          </p>

          <div className="space-y-6">
            {/* Stage 1 — Processor Platform */}
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
                    The wedge that earns trust. Scheduling, digital cut sheets, automated notifications, job tracking, and invoicing—built for how plants actually run. Processors save 5+ hours per day and their customers get a modern, self-service experience. Every processor on the platform is a node in the network.
                  </p>
                </div>
              </div>
            </div>

            {/* Stage 2 — Connected Plant */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg fade-up">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12 bg-brand-orange rounded-full flex items-center justify-center">
                  <Link2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-brand-green">Connected Plant Operations</h3>
                    <span className="bg-brand-orange/10 text-brand-orange font-bold px-3 py-0.5 rounded-full text-xs uppercase tracking-wide">Building</span>
                  </div>
                  <p className="text-stone-700">
                    Integrating with plant floor systems so that scheduling, production data, yield reporting, and financials flow through one pipeline—from the customer booking through the kill floor to the invoice. Farmshare becomes the connective tissue between the front office and the back office, eliminating the manual data bridging that costs processors hours every week.
                  </p>
                </div>
              </div>
            </div>

            {/* Stage 3 — Wholesale Tools */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg fade-up">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12 bg-brand-yellow rounded-full flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-brand-green">Wholesale & Full-Plant Tools</h3>
                    <span className="bg-brand-yellow/10 text-brand-yellow font-bold px-3 py-0.5 rounded-full text-xs uppercase tracking-wide">Coming Soon</span>
                  </div>
                  <p className="text-stone-700">
                    Most processors do both custom and wholesale. Today, Farmshare handles the custom side. Wholesale tools—inventory management, buy-sell workflows, wholesale invoicing—let processors run their entire operation from one platform. When Farmshare manages a processor's full revenue, it becomes indispensable.
                  </p>
                </div>
              </div>
            </div>

            {/* Stage 4 — Marketplace */}
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg fade-up">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-12 w-12 bg-stone-400 rounded-full flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-brand-green">The Network & Marketplace</h3>
                    <span className="bg-stone-200 text-stone-600 font-bold px-3 py-0.5 rounded-full text-xs uppercase tracking-wide">The Vision</span>
                  </div>
                  <p className="text-stone-700">
                    The endgame: a connected network where producers, processors, and buyers all operate on shared infrastructure. Processors list available inventory. Restaurants, grocers, and institutions source directly from regional producers. Fully traceable, shorter supply chains, better prices on both ends. Thousands of independent operators, collectively competing on reach and reliability—while maintaining the quality and traceability that industrial packers can't match.
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
              Join the Network
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
              <h3 className="text-lg font-bold mb-2">Refer a Processor</h3>
              <p className="group-hover:text-white/90 transition-colors text-sm">Help grow the network</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
