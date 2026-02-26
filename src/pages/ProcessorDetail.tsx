import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { MapPin, Calendar, ArrowLeft, ExternalLink, Globe, CheckCircle2 } from 'lucide-react';
import { processors, stateNames } from '../data/processors';
import { processorAboutContent } from '../data/processorAboutContent';

export default function ProcessorDetail() {
  const { stateSlug: slug } = useParams<{ stateSlug: string }>();
  const processor = processors.find(p => p.slug === slug);

  useEffect(() => {
    if (!processor) return;

    // SEO title and meta
    const city = processor.location.split(',')[0].trim();
    const stateFull = stateNames[processor.state] || processor.state;
    document.title = `${processor.name} — Custom Meat Processor in ${city}, ${stateFull} | Farmshare`;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content',
        `${processor.name} in ${processor.location} processes ${processor.species.join(', ')}. Book your harvest slot online with Farmshare — digital cut sheets, online scheduling, and order tracking.`
      );
    }

    // Inject LocalBusiness JSON-LD structured data
    const existingScript = document.querySelector('#processor-schema');
    if (existingScript) existingScript.remove();

    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": processor.name,
      "description": `${processor.name} is an independent custom meat processor in ${processor.location} offering online scheduling and digital cut sheets through Farmshare. Species processed: ${processor.species.join(', ')}.`,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": city,
        "addressRegion": stateFull,
        "addressCountry": "US"
      },
      "url": `https://farmshare.co/find-a-processor/${processor.slug}`,
      "image": processor.logo || "https://farmshare.co/og-image.png",
      "potentialAction": {
        "@type": "ReserveAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `https://partners.farmshare.co/scheduling/${processor.slug}`,
          "actionPlatform": ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"]
        },
        "result": {
          "@type": "Reservation",
          "name": "Harvest Appointment"
        }
      },
      "makesOffer": processor.species.map(s => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": `${s} Processing`,
          "description": `Custom ${s.toLowerCase()} processing with online scheduling and digital cut sheets`
        }
      }))
    };

    const script = document.createElement('script');
    script.id = 'processor-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const el = document.querySelector('#processor-schema');
      if (el) el.remove();
    };
  }, [processor]);

  if (!processor) {
    return <Navigate to="/find-a-processor" replace />;
  }

  const city = processor.location.split(',')[0].trim();
  const stateFull = stateNames[processor.state] || processor.state;
  const content = processorAboutContent[processor.slug];
  const hasRichContent = content && content.about.length >= 100;

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-brand-green">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            {processor.logo ? (
              <div className="w-24 h-24 mx-auto mb-6 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden p-2">
                <img
                  src={processor.logo}
                  alt={processor.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-24 h-24 mx-auto mb-6 rounded-xl bg-white/10 flex items-center justify-center">
                <span className="text-white font-bold text-3xl">
                  {processor.name.split(' ').map(w => w[0]).filter(c => c && c.match(/[A-Z0-9]/i)).slice(0, 2).join('').toUpperCase()}
                </span>
              </div>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight text-white font-roca tracking-tight">
              {processor.name}
            </h1>
            {content?.established && (
              <p className="text-brand-cream/60 text-sm font-medium mb-2">Est. {content.established}</p>
            )}
            <div className="flex items-center justify-center text-brand-cream/80 text-xl mb-6">
              <MapPin className="h-5 w-5 mr-2" />
              {processor.location}
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {processor.species.map(s => (
                <span key={s} className="bg-white/10 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {s}
                </span>
              ))}
            </div>
            <a
              href={`https://partners.farmshare.co/scheduling/${processor.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-orange text-white text-lg px-8 py-4 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center font-bold"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Schedule Online
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link
              to="/find-a-processor"
              className="inline-flex items-center text-brand-green font-medium hover:text-brand-orange transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Processors
            </Link>

            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <h2 className="text-2xl font-roca text-brand-green mb-4">
                About {processor.name}
              </h2>

              {hasRichContent ? (
                <p className="text-stone-700 mb-6">{content.about}</p>
              ) : (
                <p className="text-stone-700 mb-6">
                  {processor.name} is an independent custom meat processor located in {city}, {stateFull}. They process {processor.species.join(', ').replace(/, ([^,]*)$/, ' and $1')} and offer online scheduling and digital cut sheets through Farmshare.
                </p>
              )}

              {/* Certifications */}
              {content?.certifications && content.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {content.certifications.map(cert => (
                    <span key={cert} className="bg-brand-green/10 text-brand-green text-xs font-bold px-3 py-1 rounded-full">
                      {cert}
                    </span>
                  ))}
                </div>
              )}

              {/* Highlights */}
              {content?.highlights && content.highlights.length > 0 && (
                <div className="mb-6">
                  <ul className="space-y-2">
                    {content.highlights.map(h => (
                      <li key={h} className="flex items-start gap-2 text-stone-700 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-brand-orange mt-0.5 flex-shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Visit Website */}
              {content?.website && (
                <div className="mb-6">
                  <a
                    href={content.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-brand-cream rounded-lg text-brand-green font-medium hover:text-brand-orange transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    Visit Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              <h3 className="text-lg font-bold text-brand-green mb-3">What You Get with Farmshare</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-brand-cream rounded-lg p-4 text-center">
                  <Calendar className="h-8 w-8 text-brand-orange mx-auto mb-2" />
                  <p className="font-bold text-stone-800 text-sm">Online Scheduling</p>
                  <p className="text-stone-600 text-sm">Book your harvest slot from your phone</p>
                </div>
                <div className="bg-brand-cream rounded-lg p-4 text-center">
                  <svg className="h-8 w-8 text-brand-orange mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  <p className="font-bold text-stone-800 text-sm">Digital Cut Sheets</p>
                  <p className="text-stone-600 text-sm">Submit your cutting instructions online</p>
                </div>
                <div className="bg-brand-cream rounded-lg p-4 text-center">
                  <svg className="h-8 w-8 text-brand-orange mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  <p className="font-bold text-stone-800 text-sm">Order Updates</p>
                  <p className="text-stone-600 text-sm">Text & email updates on your order</p>
                </div>
              </div>

              <div className="text-center">
                <a
                  href={`https://partners.farmshare.co/scheduling/${processor.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-brand-orange text-white text-lg px-8 py-4 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center font-bold"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  View Available Dates
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>

            {/* SEO Content */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-roca text-brand-green mb-4">
                Custom Meat Processing in {city}, {stateFull}
              </h2>
              <p className="text-stone-700 mb-4">
                Looking for a meat processor near {city}, {stateFull}? {processor.name} offers custom {processor.species.join(', ').replace(/, ([^,]*)$/, ' and $1').toLowerCase()} processing with modern tools that make the experience easier for farmers, ranchers, and hunters.
              </p>
              <p className="text-stone-700 mb-4">
                Instead of playing phone tag to book a harvest slot, you can schedule online through Farmshare. Submit your cut sheet digitally from your phone—no more handwriting instructions on paper. And you'll get automatic text and email updates on your order status from drop-off to pickup.
              </p>
              <p className="text-stone-700">
                Browse more processors in <Link to={`/find-a-processor/${stateFull.toLowerCase().replace(/\s+/g, '-')}`} className="text-brand-orange font-bold hover:underline">{stateFull}</Link> or view <Link to="/find-a-processor" className="text-brand-orange font-bold hover:underline">all processors</Link> in the Farmshare network.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
