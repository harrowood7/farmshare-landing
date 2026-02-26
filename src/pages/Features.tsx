import React, { useEffect, useRef, useState } from 'react';
import { Clock, Calendar, CalendarClock, FileText, MessageSquare, Briefcase, Settings, Smartphone, TrendingUp, Bell, Users, ClipboardList, Receipt, UserCircle, BarChart3 } from 'lucide-react';

export default function Features() {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [activeTab, setActiveTab] = useState('scheduling');

  useEffect(() => {
    // Set page title and meta description for SEO
    document.title = 'Meat Processing Software Features — Scheduling, Cut Sheets & More | Farmshare';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'See how Farmshare streamlines every step of your operation — from auto-scheduling and digital cut sheets to customer messaging, job tracking, and invoicing.');
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
      title: 'Smart Scheduling',
      icon: CalendarClock,
      description: 'Save time and increase throughput with Farmshare\'s smart calendar system. Customers book their own harvest slots online, capacity limits prevent overbooking, and waitlist automation fills cancellations instantly.',
      bullets: [
        'Self-Serve Booking: Customers request slots directly through your online scheduling portal',
        'Capacity-Aware Calendar: Set daily limits by species or inspection level to prevent overbooking',
        'Drag-and-Drop Rescheduling: Balance your weekly workload by moving jobs with a click',
        'Waitlist Backfill: Automatically notify waitlisted customers when a slot opens up'
      ],
      video: 'https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/demo%20videos/scheduling%20and%20capacity%20v2.mp4'
    },
    cutsheets: {
      title: 'Digital Cut Sheets',
      icon: FileText,
      description: 'Ditch the paper. Customers submit their cut selections online from reusable templates. Your team gets clean, reliable instructions at the point of cut\u2014every time.',
      bullets: [
        'Reusable Templates: Customers duplicate past cut sheets with one click',
        'Processor-Defined Logic: Enforce business rules to prevent impossible or conflicting selections',
        'Custom Configuration: Tailor layout, categories, extras, and trim to match your workflow',
        'Print Anywhere: View and print cut sheets from the office or the cut room'
      ],
      video: 'https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/demo%20videos/cutsheets%20and%20capabilities.mp4'
    },
    notifications: {
      title: 'Automated Notifications',
      icon: Bell,
      description: 'Stop chasing customers by phone. Farmshare sends automatic text and email updates at every stage\u2014so your team stays focused on processing, not communicating.',
      bullets: [
        'Drop-off & Pickup Reminders: Customers get notified automatically with dates and instructions',
        'Missing Info Alerts: Flag missing cut sheets or incomplete orders before they become problems',
        'Status Updates: Customers know when their animal is harvested, hanging, cut, and ready',
        'Custom Templates: Save time with reusable message formats for common touchpoints'
      ],
      video: 'https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/demo%20videos/customer%20communication.mp4'
    },
    portal: {
      title: 'Customer Portal',
      icon: Users,
      description: 'Your customers get their own portal to book, submit cut sheets, and track order status\u2014all from their phone. Free for every producer and end customer on your plant.',
      bullets: [
        'Self-Service Booking: Producers pick available dates and submit requests without calling',
        'Digital Cut Sheet Submission: Customers fill out selections online instead of faxing or handwriting',
        'Order Status Tracking: Real-time visibility into where their animal is in the process',
        'No Cost to Customers: The portal is free for every producer when their processor is on Farmshare'
      ],
      video: 'https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/demo%20videos/scheduling%20and%20capacity%20v2.mp4'
    },
    tracking: {
      title: 'Job Tracking',
      icon: ClipboardList,
      description: 'Track every animal from drop-off to pickup. Farmshare keeps your team aligned with clear status stages and full visibility from a single dashboard.',
      bullets: [
        'Status Stages: Every job moves through Scheduled \u2192 Dropped Off \u2192 Harvested \u2192 Hanging \u2192 Cut \u2192 Packaged \u2192 Ready for Pickup \u2192 Complete',
        'Single Dashboard: See all active jobs, their status, and what needs attention today',
        'Tracking Numbers: Every animal gets a unique ID from arrival to pickup',
        'Team Alignment: Everyone from the kill floor to the front office sees the same data'
      ],
      video: 'https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/demo%20videos/job%20workflow%20and%20agenda%20.mp4'
    },
    invoicing: {
      title: 'Invoicing',
      icon: Receipt,
      description: 'Invoices are generated automatically from hanging weights and cut sheet selections. No manual math, no transcription errors, no double entry.',
      bullets: [
        'Auto-Calculated: Charges computed from actual carcass weight, slaughter fee, and processing fee',
        'Line Item Detail: Every charge tied to real weights and customer selections',
        'Finalize & Send: Review, approve, and send invoices to customers in one click',
        'Accounting Export: Export billing and payment data to QuickBooks or your accounting system'
      ],
      video: 'https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/demo%20videos/insights%20and%20automation.mp4'
    },
    profiles: {
      title: 'Customer Profiles',
      icon: UserCircle,
      description: 'Every customer gets a complete profile with their full history\u2014jobs, cut preferences, weights, and payments. Your office team never has to dig through files again.',
      bullets: [
        'Full Job History: See every past and current job for any customer at a glance',
        'Cut Preferences: Know what each customer typically orders before they even submit',
        'Weight & Yield Records: Historical hanging weights, yield percentages, and trends',
        'Payment History: Track invoices, balances, and payment status per customer'
      ],
      video: 'https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/demo%20videos/job%20workflow%20and%20agenda%20.mp4'
    },
    reporting: {
      title: 'Reporting',
      icon: BarChart3,
      description: 'See how your plant is performing at a glance. Farmshare tracks throughput, species mix, and customer trends so you can make smarter decisions about your operation.',
      bullets: [
        'Weekly Throughput: Monitor how many head you\'re processing week over week',
        'Species Breakdown: See your mix of beef, hog, lamb, and other species over time',
        'Customer Trends: Identify your most active customers and seasonal patterns',
        'Yield Tracking: Compare hanging weights and cut yields across jobs'
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
              Everything You Need to Run a Tighter Plant
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-stone-600 mb-6 lg:mb-8 font-medium stagger-child">
              From scheduling to invoicing, see how Farmshare streamlines every step of your operation.
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

      {/* Smart Features — tabbed breakdown right after hero */}
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
            Most plants are up and running in under two weeks. See how Farmshare can work for yours.
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
