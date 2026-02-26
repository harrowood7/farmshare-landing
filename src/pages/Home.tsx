import React, { useEffect, useRef, useState } from 'react';
import { Factory, Calendar, Clock, Smartphone, TrendingUp, Quote, ArrowRight, Phone, FileX, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import LogoBanner from '../components/LogoBanner';
import PartnerLogoBanner from '../components/PartnerLogoBanner';
import ROICalculator from '../components/ROICalculator';

export default function Home() {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [showStickyButton, setShowStickyButton] = useState(false);

  useEffect(() => {
    document.title = 'Farmshare - Modern Software for Independent Meat Processors';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Save 5+ hours a day with Farmshare\'s scheduling, cut sheet, and invoicing software built for independent meat processors. Trusted by 30+ plants nationwide.');
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

      {/* ============================================
          SECTION 1: HERO — Lead with the outcome
          ============================================ */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div 
          ref={parallaxRef}
          className="parallax-bg"
          style={{ 
            backgroundImage: 'url(/hero-processor.png)'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 to-brand-cream/70"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center fade-up">
            <h1 className="text-5xl md:text-6xl lg:text-7xl mb-8 leading-tight text-brand-green font-roca tracking-tight stagger-child">
              Slash Admin Time.<br />
              Fill Your Calendar.<br />
              Move More Meat.
            </h1>
            <p className="text-xl md:text-2xl text-stone-600 mb-8 font-medium stagger-child">
              Farmshare is the all-in-one platform for independent meat processors—automating scheduling, cut sheets, customer messaging, and invoicing so you can spend less time on paperwork and more time processing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center stagger-child">
              <a 
                href="https://meetings.hubspot.com/henry-arrowood/quad-p-demo"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-brand-orange text-white text-lg px-8 py-4 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center justify-center font-bold"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Schedule a Demo
              </a>
              <a
                href="#roi-calculator"
                className="bg-white text-brand-green text-lg px-8 py-4 rounded-lg hover:bg-brand-cream transition-colors inline-flex items-center justify-center font-bold border-2 border-brand-green"
              >
                Calculate Your ROI
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 2: PAIN — The daily grind
          ============================================ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-roca text-brand-green text-center mb-4 fade-up">Sound Familiar?</h2>
            <p className="text-xl text-stone-500 text-center mb-12 fade-up">Most processors we talk to are dealing with the same problems every single week.</p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-brand-cream rounded-xl p-6 fade-up">
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-brand-green mb-2">Phone Tag All Day</h3>
                <p className="text-stone-600">Hours spent calling customers back about scheduling, cut instructions, and pickup times—instead of actually processing.</p>
              </div>

              <div className="bg-brand-cream rounded-xl p-6 fade-up">
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <FileX className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-brand-green mb-2">Paper Cut Sheets & Errors</h3>
                <p className="text-stone-600">Illegible faxes, missing instructions, and mistakes that cost time and product. Customers get frustrated, your team gets blamed.</p>
              </div>

              <div className="bg-brand-cream rounded-xl p-6 fade-up">
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-brand-green mb-2">No-Shows & Lost Revenue</h3>
                <p className="text-stone-600">Empty slots from cancellations and no-shows. No waitlist to fill them. Revenue walks out the door every week.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 3: COST — What it adds up to
          ============================================ */}
      <section className="py-12 bg-brand-green">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8 fade-up">
            <h2 className="text-3xl font-roca text-white mb-2">What It's Costing You</h2>
            <p className="text-brand-cream/70">For a 20-head/week plant, the manual approach adds up fast.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div className="fade-up">
              <p className="text-4xl font-bold text-white font-roca">5+ hrs</p>
              <p className="text-brand-cream/80 font-medium mt-1">Lost to Admin Per Day</p>
            </div>
            <div className="fade-up">
              <p className="text-4xl font-bold text-white font-roca">15%</p>
              <p className="text-brand-cream/80 font-medium mt-1">Throughput Left on the Table</p>
            </div>
            <div className="fade-up">
              <p className="text-4xl font-bold text-white font-roca">6 tools</p>
              <p className="text-brand-cream/80 font-medium mt-1">Duct-Taped Together</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 4: SOLUTION — How Farmshare fixes it
          ============================================ */}
      <section className="py-20 bg-brand-cream">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16 fade-up">
            <h2 className="text-4xl font-roca text-brand-green mb-4">One Platform. Everything You Need.</h2>
            <p className="text-xl text-stone-600">Replace your calendar, spreadsheets, cut cards, texts, and invoicing tools with a single dashboard built for how your plant actually runs.</p>
          </div>
          
          <div className="grid md:grid-cols-2 items-center gap-8 mb-20">
            <div className="fade-up">
              <div className="flex items-center space-x-4 mb-6 stagger-child">
                <Factory className="h-8 w-8 text-brand-green" />
                <h3 className="text-3xl font-roca text-brand-orange">Smart Scheduling</h3>
              </div>
              <p className="text-xl text-stone-700 leading-relaxed mb-6 stagger-child">
                Customers book their own harvest slots through your online portal. Capacity limits prevent overbooking. Drag-and-drop rescheduling keeps your week balanced. Waitlist automation fills cancellations instantly.
              </p>
            </div>
            <div className="rounded-lg shadow-[0_20px_50px_rgba(0,111,53,0.2)] overflow-hidden fade-up">
              <video 
                className="w-full h-full object-cover"
                autoPlay muted loop playsInline
                disablePictureInPicture disableRemotePlayback
                preload="metadata" poster=""
              >
                <source src="https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/demo%20videos/scheduling%20and%20capacity%20v2.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

          <div className="grid md:grid-cols-2 items-center gap-8 mb-20">
            <div className="order-2 md:order-1 rounded-lg shadow-[0_20px_50px_rgba(0,111,53,0.2)] overflow-hidden fade-up">
              <video 
                className="w-full h-full object-cover"
                autoPlay muted loop playsInline
                disablePictureInPicture disableRemotePlayback
                preload="none" poster=""
              >
                <source src="https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/demo%20videos/cutsheets%20and%20capabilities.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="order-1 md:order-2 fade-up">
              <div className="flex items-center space-x-4 mb-6 stagger-child">
                <Factory className="h-8 w-8 text-brand-green" />
                <h3 className="text-3xl font-roca text-brand-orange">Digital Cut Sheets</h3>
              </div>
              <p className="text-xl text-stone-700 leading-relaxed mb-6 stagger-child">
                No more illegible faxes or missed instructions. Customers submit cut selections online from reusable templates. Your team gets clean, reliable specs at the point of cut—every time.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 items-center gap-8">
            <div className="fade-up">
              <div className="flex items-center space-x-4 mb-6 stagger-child">
                <Factory className="h-8 w-8 text-brand-green" />
                <h3 className="text-3xl font-roca text-brand-orange">Automated Notifications</h3>
              </div>
              <p className="text-xl text-stone-700 leading-relaxed mb-6 stagger-child">
                Automated text and email reminders for drop-offs, pickups, and missing cut sheets. Customers stay informed without your team picking up the phone. No-shows drop. Cancellations get filled from the waitlist.
              </p>
            </div>
            <div className="rounded-lg shadow-[0_20px_50px_rgba(0,111,53,0.2)] overflow-hidden fade-up">
              <video 
                className="w-full h-full object-cover"
                autoPlay muted loop playsInline
                disablePictureInPicture disableRemotePlayback
                preload="none" poster=""
              >
                <source src="https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/demo%20videos/customer%20communication.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

          <div className="text-center mt-12 fade-up">
            <Link 
              to="/features"
              className="bg-brand-orange text-white text-lg px-8 py-4 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center font-bold"
            >
              See All Features
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 5: PROOF — Social proof & testimonials
          ============================================ */}
      <LogoBanner />

      <section className="py-20 bg-brand-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-roca text-brand-green text-center mb-12 fade-up">What Processors Are Saying</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-lg fade-up">
                <Quote className="h-8 w-8 text-brand-orange mb-4" />
                <p className="text-lg text-stone-700 mb-6 leading-relaxed">
                  "Scheduling has never been easier! We can manage our appointments in the office or on the go, which for our small business is a BIG deal! What really sets Farmshare apart is their team — energetic, forward-thinking, and genuinely committed to helping businesses like ours run more efficiently."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-brand-cream flex items-center justify-center overflow-hidden p-1 mr-4">
                    <img
                      src="https://www.butchersblockva.com/mt-content/uploads/2020/11/thumbnails/butchers-block-black-grunge_m_264x300.png"
                      alt="The Butcher's Block"
                      className="max-w-full max-h-full object-contain"
                      loading="lazy" decoding="async"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-brand-green">Samantha Stallings</p>
                    <p className="text-stone-600">The Butcher's Block</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-lg fade-up">
                <Quote className="h-8 w-8 text-brand-orange mb-4" />
                <p className="text-lg text-stone-700 mb-6 leading-relaxed">
                  "Farmshare has been a game-changer for our processing operation. Their software's scheduling feature allows our customers to schedule their own appointments with ease, and we can manage our calendar and customer information without the usual hassle. This capability alone has saved us countless hours that we can use for other tasks."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-brand-cream flex items-center justify-center overflow-hidden p-1 mr-4">
                    <img
                      src="/logos/zk-ranches.png"
                      alt="ZK Ranches"
                      className="max-w-full max-h-full object-contain"
                      loading="lazy" decoding="async"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-brand-green">Zac Knowles</p>
                    <p className="text-stone-600">ZK Ranches</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-lg shadow-lg fade-up">
                <Quote className="h-8 w-8 text-brand-orange mb-4" />
                <p className="text-lg text-stone-700 mb-6 leading-relaxed">
                  "The platform is intuitive and built with both the producer and processor in mind. It has also streamlined the information transfer between the different departments within our company."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg bg-brand-green flex items-center justify-center mr-4">
                    <span className="text-white font-bold text-lg">PV</span>
                  </div>
                  <div>
                    <p className="font-bold text-brand-green">Prairie Valley Meats</p>
                    <p className="text-stone-600">Hoven, SD</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          SECTION 6: ROI CALCULATOR
          ============================================ */}
      <ROICalculator />

      {/* Partners */}
      <PartnerLogoBanner />

      {/* ============================================
          SECTION 7: FINAL CTA
          ============================================ */}
      <section className="py-20 bg-brand-green">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center fade-up">
            <h2 className="text-3xl md:text-4xl font-roca text-white mb-6 stagger-child">Ready to Run a Tighter Plant?</h2>
            <p className="text-xl text-brand-cream/80 mb-8 stagger-child">
              See how Farmshare can save your team hours every day. Most processors are up and running in under two weeks.
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
    </>
  );
}
