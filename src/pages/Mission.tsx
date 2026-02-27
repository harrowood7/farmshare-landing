import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Mail, Users, Factory, Link2, ShoppingCart, BarChart3, Network, TrendingUp, Wrench } from 'lucide-react';

function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const start = performance.now();
          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const stages = [
  {
    icon: Factory,
    title: 'Processor Platform',
    badge: 'Live Now',
    badgeBg: 'bg-brand-green/10',
    badgeText: 'text-brand-green',
    iconBg: 'bg-brand-green',
    description: 'The wedge that earns trust. Scheduling, digital cut sheets, automated notifications, job tracking, and invoicing—built for how plants actually run. Processors save 5+ hours per day and their customers get a modern, self-service experience.',
  },
  {
    icon: Link2,
    title: 'Connected Plant Operations',
    badge: 'Building',
    badgeBg: 'bg-brand-orange/10',
    badgeText: 'text-brand-orange',
    iconBg: 'bg-brand-orange',
    description: 'Integrating with plant floor systems so scheduling, production data, yield reporting, and financials flow through one pipeline—from customer booking through the kill floor to the invoice.',
  },
  {
    icon: BarChart3,
    title: 'Wholesale & Full-Plant Tools',
    badge: 'Coming Soon',
    badgeBg: 'bg-brand-yellow/10',
    badgeText: 'text-brand-yellow',
    iconBg: 'bg-brand-yellow',
    description: 'Most processors do both custom and wholesale. Wholesale tools—inventory management, buy-sell workflows, wholesale invoicing—let processors run their entire operation from one platform.',
  },
  {
    icon: ShoppingCart,
    title: 'The Network & Marketplace',
    badge: 'The Vision',
    badgeBg: 'bg-stone-200',
    badgeText: 'text-stone-600',
    iconBg: 'bg-stone-400',
    description: 'A connected network where producers, processors, and buyers all operate on shared infrastructure. Fully traceable, shorter supply chains, better prices on both ends—thousands of independents competing together.',
  },
];

export default function Mission() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'Our Mission - The Operating System for Independent Meat | Farmshare';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Four companies control 85% of beef processing in America. Their advantage isn\'t quality—it\'s coordination. Farmshare is building the infrastructure that lets independent processors compete.');
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

    const handleScroll = () => {
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translate3d(0, ${window.scrollY * 0.5}px, 0)`;
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
      {/* ============================================
          HERO
          ============================================ */}
      <section className="relative py-12 md:py-20 lg:py-32 overflow-hidden">
        <div
          ref={parallaxRef}
          className="parallax-bg"
          style={{ backgroundImage: 'url(/hero-mission.png)' }}
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

      {/* ============================================
          THE PROBLEM — Stats row + short context
          ============================================ */}
      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-roca text-brand-orange text-center mb-10 md:mb-14 fade-up">The Problem</h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-10 md:mb-14">
            <div className="text-center fade-up">
              <p className="text-5xl md:text-6xl font-roca text-brand-green mb-2">
                <AnimatedNumber target={85} suffix="%" />
              </p>
              <p className="text-stone-600 text-sm md:text-base">of U.S. beef processing controlled by four companies</p>
            </div>
            <div className="text-center fade-up">
              <p className="text-5xl md:text-6xl font-roca text-brand-green mb-2">
                <AnimatedNumber target={3000} suffix="+" />
              </p>
              <p className="text-stone-600 text-sm md:text-base">independent processors serving growing local demand</p>
            </div>
            <div className="text-center fade-up">
              <p className="text-5xl md:text-6xl font-roca text-brand-green mb-2">
                <AnimatedNumber target={20} suffix=" yr" />
              </p>
              <p className="text-stone-600 text-sm md:text-base">old software and paper systems most plants still run on</p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center fade-up">
            <p className="text-base md:text-lg text-stone-700 leading-relaxed">
              The largest packers don't dominate because they produce better meat—they dominate because they can coordinate at scale. Independent processors produce the quality and traceability consumers want, but they're fragmented, disconnected, and running blind. Meanwhile, demand for local meat is surging and new USDA-funded capacity is coming online. The opportunity has never been bigger. The infrastructure to seize it hasn't existed—until now.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================
          VIDEO
          ============================================ */}
      <section className="py-8 md:py-12 lg:py-16 bg-brand-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
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
        </div>
      </section>

      {/* ============================================
          WHAT WE BELIEVE — Horizontal cards with icons
          ============================================ */}
      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-roca text-brand-orange text-center mb-10 md:mb-14 fade-up">What We Believe</h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-brand-cream rounded-xl p-6 md:p-8 text-center fade-up">
              <div className="h-14 w-14 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <Network className="h-7 w-7 text-brand-green" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-brand-green mb-3">The Network Wins</h3>
              <p className="text-sm md:text-base text-stone-600 leading-relaxed">
                One processor can't supply a restaurant chain. Fifty on a shared platform can. The future of independent meat is processors becoming more powerful together than they could ever be apart.
              </p>
            </div>

            <div className="bg-brand-cream rounded-xl p-6 md:p-8 text-center fade-up">
              <div className="h-14 w-14 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <TrendingUp className="h-7 w-7 text-brand-orange" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-brand-green mb-3">Revenue Over Cost Cutting</h3>
              <p className="text-sm md:text-base text-stone-600 leading-relaxed">
                The industry obsesses over shaving pennies off processing costs. The real leverage is revenue—filling your calendar, reducing no-shows, balancing the carcass. A 5% improvement in how you sell beats 5% in how you cut by 10x.
              </p>
            </div>

            <div className="bg-brand-cream rounded-xl p-6 md:p-8 text-center fade-up">
              <div className="h-14 w-14 bg-brand-yellow/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <Wrench className="h-7 w-7 text-brand-yellow" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-brand-green mb-3">Start Where It Hurts</h3>
              <p className="text-sm md:text-base text-stone-600 leading-relaxed">
                We didn't start by building a marketplace. We started by solving the most painful daily problem: scheduling. Earn trust with a tool that saves hours every day, then build the connective tissue between everyone in the supply chain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          PULL QUOTE DIVIDER
          ============================================ */}
      <section className="py-12 md:py-16 bg-brand-green">
        <div className="container mx-auto px-4">
          <p className="max-w-3xl mx-auto text-center text-xl md:text-2xl lg:text-3xl font-roca text-white leading-snug">
            The scheduling wedge got us in the door. The network keeps us in the room. The marketplace owns the room.
          </p>
        </div>
      </section>

      {/* ============================================
          WHERE WE'RE GOING — Vertical connected timeline
          ============================================ */}
      <section className="py-12 md:py-16 lg:py-20 bg-brand-cream">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-roca text-brand-orange text-center mb-4 fade-up">Where We're Going</h2>
          <p className="text-base md:text-lg text-stone-600 text-center mb-12 md:mb-16 max-w-2xl mx-auto fade-up">
            Each stage adds participants to the network and funds the next.
          </p>

          <div className="max-w-3xl mx-auto relative">
            {/* Timeline connector line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-green via-brand-orange via-70% to-stone-300 hidden md:block"></div>

            {stages.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <div key={i} className={`relative flex items-start gap-5 md:gap-8 fade-up ${i < stages.length - 1 ? 'mb-8 md:mb-12' : ''}`}>
                  {/* Icon circle (sits on the timeline line) */}
                  <div className={`flex-shrink-0 h-12 w-12 md:h-16 md:w-16 ${stage.iconBg} rounded-full flex items-center justify-center z-10 shadow-lg`}>
                    <Icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
                  </div>

                  {/* Content card */}
                  <div className="bg-white rounded-xl p-5 md:p-7 shadow-lg flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg md:text-xl font-bold text-brand-green">{stage.title}</h3>
                      <span className={`${stage.badgeBg} ${stage.badgeText} font-bold px-3 py-0.5 rounded-full text-xs uppercase tracking-wide`}>
                        {stage.badge}
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-stone-600 leading-relaxed">{stage.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA
          ============================================ */}
      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
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
      </section>
    </div>
  );
}
