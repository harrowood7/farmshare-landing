import React, { useEffect, useRef, useState } from 'react';
import { Factory, Clock, BarChart, Calendar, CalendarClock, FileText, MessageSquare, Briefcase, Settings, Calculator, Smartphone, TrendingUp, Quote } from 'lucide-react';
import LogoBanner from '../components/LogoBanner';

export default function Processors() {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [activeTab, setActiveTab] = useState('scheduling');

  useEffect(() => {
    // Set page title and meta description for SEO
    document.title = 'Meat Processing Software - Streamline Operations | Farmshare';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Boost efficiency with Farmshare\'s meat processing software. Auto-scheduling, digital cut sheets, customer messaging, and job tracking for independent processors.');
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

  const features = {
    scheduling: {
      title: 'Scheduling & Capacity',
      icon: CalendarClock,
      description: 'Save time and increase throughput with Farmshare\'s smart calendar system. Automate bookings, reduce no-shows, and eliminate scheduling conflicts with real-time updates and capacity-aware slot management.',
      bullets: [
        'Self-Serve Scheduling: Customers request bookings directly through your online portal',
        'Capacity-Aware Calendar: Prevent overbooking with automated daily limits by species or inspection level',
        'Dynamic Rescheduling: Easily drag-and-drop jobs to balance workloads across your week',
        'Waitlist Automation: Automatically fill cancellations by notifying interested customers instantly'
      ],
      video: 'https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/demo%20videos/scheduling%20and%20capacity%20v2.mp4'
    },
    cutsheets: {
      title: 'Smart Cut Sheets',
      icon: FileText,
      description: 'Ditch the paper. Farmshare digitizes your cut sheets so customers can submit their selections online, while giving your team reliable, legible instructions at the point of cut—every time.',
      bullets: [
        'Reusable Templates: Customers can reuse or duplicate past cut sheets with one click',
        'Processor-Defined Logic: Enforce business rules to prevent impossible or conflicting selections',
        'Custom Configuration: Tailor cut sheet layout, categories, extras, and trim to match your workflow',
        'Instant Access: View and print cut sheets anywhere—from the office or the cut room'
      ],
      video: 'https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/demo%20videos/cutsheets%20and%20capabilities.mp4'
    },
    communication: {
      title: 'Customer Messaging',
      icon: MessageSquare,
      description: 'Reach every customer with ease. Farmshare centralizes messaging and automates key touchpoints, ensuring no one misses an update—and your team spends less time on the phone.',
      bullets: [
        'Text & Email Notifications: Automatically remind customers of drop-offs, pickups, and missing info',
        'Shared Inbox: View and reply to customer texts in a centralized messaging hub',
        'Smart Alerts: Flag missing cut sheets, unpaid invoices, and no-show risks in real time',
        'Custom Message Templates: Save time with reusable message formats for common touchpoints'
      ],
      video: 'https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/demo%20videos/customer%20communication.mp4'
    },
    management: {
      title: 'Workflow & Job Tracking',
      icon: Briefcase,
      description: 'Track every animal from drop-off to pickup. Farmshare keeps your data organized, your team aligned, and your customer records complete—with less manual input.',
      bullets: [
        'Full Job Visibility: Track harvest, cut, yield, and invoice details from a single dashboard',
        'Customer Profiles: View complete job history, cuts, weights, and payments for every customer',
        'Invoice Generation: Automatically calculate charges by carcass weight, extras, and trim',
        'Accounting Sync: Export billing and payment data to reduce double entry'
      ],
      video: 'https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/demo%20videos/job%20workflow%20and%20agenda%20.mp4'
    },
    other: {
      title: 'Insights & Automation',
      icon: Settings,
      description: 'Farmshare is more than just scheduling. From carcass tags to custom invoicing rules, the platform flexes to match the unique needs of your plant.',
      bullets: [
        'Carcass Tagging: Auto-generate and print tags with tracking numbers and weights',
        'Flexible Pricing Rules: Configure slaughter fees, refunds, and deposits per species',
        'Inventory Tracking: Enter final cut weights by category or total yield',
        'Analytics Dashboard: Monitor weekly throughput, species mix, and customer trends'
      ],
      video: 'https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/demo%20videos/insights%20and%20automation.mp4'
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream">
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

      <section className="relative py-12 md:py-20 lg:py-32 overflow-hidden">
        <div 
          ref={parallaxRef}
          className="parallax-bg"
          style={{ 
            backgroundImage: 'url("/hero-facility.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 to-brand-cream/70"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center fade-up">
            <h1 className="text-4xl md:text-5xl lg:text-7xl mb-4 md:mb-6 lg:mb-8 leading-tight text-brand-green font-roca tracking-tight stagger-child">
              Slash Admin Time.
              <br />
              Fill Your Calendar.
              <br />
              Move More Meat.
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-stone-600 mb-6 lg:mb-8 font-medium stagger-child">
              Farmshare helps you run a tighter plant with auto-scheduling, live tracking, and simplified communications—all from one dashboard. Trusted by 30+ processors nationwide.
            </p>
            <a 
              href="https://meetings.hubspot.com/henry-arrowood/quad-p-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-orange text-white text-lg px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center font-bold stagger-child"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Schedule a Demo
            </a>
          </div>
        </div>
      </section>

      <LogoBanner />

      {/* Value Props */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Time Savings */}
            <div className="bg-brand-cream rounded-lg p-8 transform hover:-translate-y-2 transition-transform duration-300 fade-up">
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 bg-brand-orange rounded-full flex items-center justify-center mr-4">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-brand-green">5 hrs</h3>
              </div>
              <p className="text-xl font-medium text-brand-orange mb-4">Saved Per Day</p>
              <p className="text-stone-700">Cut back on paperwork, phone calls, and manual entry with automated scheduling, cut sheets, notifications, and invoicing.</p>
            </div>

            {/* Tools Replaced */}
            <div className="bg-brand-cream rounded-lg p-8 transform hover:-translate-y-2 transition-transform duration-300 fade-up">
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 bg-brand-orange rounded-full flex items-center justify-center mr-4">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-brand-green">6</h3>
              </div>
              <p className="text-xl font-medium text-brand-orange mb-4">Tools Replaced</p>
              <p className="text-stone-700">Farmshare combines your calendar, cut cards, spreadsheets, text/email tools, payment processing, and billing—all in a single platform.</p>
            </div>

            {/* Throughput */}
            <div className="bg-brand-cream rounded-lg p-8 transform hover:-translate-y-2 transition-transform duration-300 fade-up">
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 bg-brand-orange rounded-full flex items-center justify-center mr-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-brand-green">15%</h3>
              </div>
              <p className="text-xl font-medium text-brand-orange mb-4">Weekly Throughput</p>
              <p className="text-stone-700">Reduce no-shows and cancellations, and drive more bookings from new and returning customers through self-serve scheduling and waitlist tools.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12 fade-up">
            <h2 className="text-4xl font-roca text-brand-green mb-6">What Our Customers Say</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="bg-brand-cream p-6 rounded-lg shadow-lg fade-up">
              <Quote className="h-8 w-8 text-brand-orange mb-4" />
              <p className="text-lg text-stone-700 mb-6">
                "Scheduling has never been easier! We can manage our appointments in the office or on the go, which for our small business is a BIG deal! What really sets Farmshare apart is their team — energetic, forward-thinking, and genuinely committed to helping businesses like ours run more efficiently."
              </p>
              <div className="flex items-center">
                <img 
                  src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face" 
                  alt="Samantha Stallings" 
                  className="w-12 h-12 rounded-full object-cover mr-4 bg-brand-cream"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div>
                  <p className="font-bold text-brand-green">Samantha Stallings</p>
                  <p className="text-stone-600">The Butchers Block</p>
                </div>
              </div>
            </div>
            
            <div className="bg-brand-cream p-6 rounded-lg shadow-lg fade-up">
              <Quote className="h-8 w-8 text-brand-orange mb-4" />
              <p className="text-lg text-stone-700 mb-6">
                "Farmshare has been a game-changer for our processing operation. Their software's scheduling feature allows our customers to schedule their own appointments with ease, and we can manage our calendar and customer information without the usual hassle. This capability alone has saved us countless hours that we can use for other tasks."
              </p>
              <div className="flex items-center">
                <img 
                  src="https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content//zac1.png?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face" 
                  alt="Zac Knowles" 
                  className="w-12 h-12 rounded-full object-cover mr-4 bg-brand-cream"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div>
                  <p className="font-bold text-brand-green">Zac Knowles</p>
                  <p className="text-stone-600">ZK Ranches</p>
                </div>
              </div>
            </div>
            
            <div className="bg-brand-cream p-6 rounded-lg shadow-lg fade-up">
              <Quote className="h-8 w-8 text-brand-orange mb-4" />
              <p className="text-lg text-stone-700 mb-6">
                "The platform is intuitive and built with both the producer and processor in mind. It has also streamlined the information transfer between the different departments within our company."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-brand-green flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-lg">PV</span>
                </div>
                <div>
                  <p className="font-bold text-brand-green">Prairie Valley Meats</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-roca text-brand-green text-center mb-12">Smart Features</h2>
            
            {/* Feature Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {Object.entries(features).map(([key, feature]) => {
                const Icon = feature.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      activeTab === key
                        ? 'bg-brand-orange text-white'
                        : 'bg-brand-cream text-stone-700 hover:bg-brand-orange/10'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    <span className="font-medium">{feature.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Feature Content */}
            {Object.entries(features).map(([key, feature]) => (
              <div
                key={key}
                className={`transition-all duration-300 ${
                  activeTab === key ? 'opacity-100' : 'hidden opacity-0'
                }`}
              >
                <div className="bg-brand-cream rounded-lg overflow-hidden shadow-lg p-8">
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-brand-green mb-4 flex items-center">
                      <feature.icon className="h-6 w-6 mr-2 text-brand-orange" />
                      {feature.title}
                    </h3>
                    <p className="text-stone-700">{feature.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="relative h-[300px] rounded-lg overflow-hidden">
                      <video 
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        poster=""
                      >
                        <source src={feature.video} type="video/mp4" />
                      </video>
                    </div>
                    
                    <ul className="space-y-4">
                      {feature.bullets.map((bullet, index) => {
                        const [title, description] = bullet.split(': ');
                        return (
                          <li key={index} className="flex flex-col">
                            
                            <span className="font-bold text-brand-green">{title}</span>
                            <span className="text-stone-700">{description}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Your Customers Will Love It Too */}
      <section className="py-20 bg-brand-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-roca text-brand-green text-center mb-4 fade-up">Your Customers Will Love It Too</h2>
            <p className="text-xl text-stone-600 text-center mb-12 fade-up">When your producers use Farmshare, your whole operation runs smoother—fewer calls, fewer mix-ups, fewer headaches.</p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-lg text-center fade-up">
                <CalendarClock className="h-12 w-12 text-brand-orange mx-auto mb-6" />
                <h3 className="text-xl font-bold text-brand-green mb-4">Self-Serve Booking</h3>
                <p className="text-stone-700">Producers book their own harvest slots online—no more phone tag or back-and-forth scheduling.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg text-center fade-up">
                <FileText className="h-12 w-12 text-brand-orange mx-auto mb-6" />
                <h3 className="text-xl font-bold text-brand-green mb-4">Digital Cut Sheets</h3>
                <p className="text-stone-700">Customers submit cut selections from their phone. Your team gets clean, legible specs every time.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg text-center fade-up">
                <MessageSquare className="h-12 w-12 text-brand-orange mx-auto mb-6" />
                <h3 className="text-xl font-bold text-brand-green mb-4">Automatic Updates</h3>
                <p className="text-stone-700">Text and email reminders for drop-offs, pickups, and status changes—so you're not chasing anyone down.</p>
              </div>
            </div>
            <p className="text-center text-stone-500 mt-8 fade-up">Free for producers and end customers when their processor is on Farmshare.</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center fade-up">
          <h2 className="text-2xl md:text-3xl font-roca text-brand-orange mb-4 md:mb-6 stagger-child">Ready to Run a Tighter Plant?</h2>
          <p className="text-base md:text-xl text-stone-700 mb-6 md:mb-8 stagger-child">
            Join 30+ processors already saving hours every day with Farmshare. Most plants are up and running in under two weeks.
          </p>
          <a 
            href="https://meetings.hubspot.com/henry-arrowood/quad-p-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-orange text-white text-lg px-6 md:px-8 py-3 md:py-4 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center font-bold stagger-child"
          >
            <Calendar className="mr-2 h-5 w-5" />
            Schedule Your Demo
          </a>
        </div>
      </div>
    </div>
  );
}