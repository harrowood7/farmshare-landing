import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { MapPin, Calendar, ArrowLeft, ExternalLink, Globe, CheckCircle2, Send, Phone, Star, Clock, Map as MapIcon } from 'lucide-react';
import { processors, stateNames, partnerSlugFor, partnerFacilitiesFor, type Processor } from '../data/processors';
import { processorAboutContent } from '../data/processorAboutContent';
import RequestSchedulingModal from '../components/RequestSchedulingModal';

function initialsFor(name: string): string {
  return name.split(' ').map(w => w[0]).filter(c => c && c.match(/[A-Z0-9]/i)).slice(0, 2).join('').toUpperCase();
}

function HeroLogo({ processor }: { processor: Processor }) {
  const [failed, setFailed] = useState(false);
  if (!processor.logo || failed) {
    return (
      <div className="w-24 h-24 mx-auto mb-6 rounded-xl bg-white/10 flex items-center justify-center">
        <span className="text-white font-bold text-3xl">{initialsFor(processor.name)}</span>
      </div>
    );
  }
  return (
    <img
      src={processor.logo}
      alt={processor.name}
      className="w-24 h-24 mx-auto mb-6 object-contain"
      onError={() => setFailed(true)}
    />
  );
}

export default function ProcessorDetail() {
  const { stateSlug: slug } = useParams<{ stateSlug: string }>();
  const processor = processors.find(p => p.slug === slug);
  const [requestOpen, setRequestOpen] = useState(false);
  const isCustomer = processor?.status === 'customer';

  useEffect(() => {
    if (!processor) return;

    // SEO title and meta
    const rawCity = processor.location.split(',')[0].trim();
    const city = /^\d/.test(rawCity) ? '' : rawCity;
    const stateFull = stateNames[processor.state] || processor.state;
    document.title = `${processor.name} — Custom Meat Processor in ${city ? `${city}, ` : ''}${stateFull} | Farmshare`;

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
        "addressLocality": city || undefined,
        "addressRegion": stateFull,
        "addressCountry": "US"
      },
      "url": `https://farmshare.co/find-a-processor/${processor.slug}`,
      "image": processor.logo || "https://farmshare.co/og-image.png",
      "potentialAction": {
        "@type": "ReserveAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": `https://partners.farmshare.co/scheduling/${partnerSlugFor(processor)}`,
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

  const rawCity = processor.location.split(',')[0].trim();
  const city = /^\d/.test(rawCity) ? '' : rawCity;
  const stateFull = stateNames[processor.state] || processor.state;
  const content = processorAboutContent[processor.slug];
  const hasRichContent = content && content.about.length >= 100;

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-brand-green">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <HeroLogo processor={processor} />
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight text-white font-roca tracking-tight">
              {processor.name}
            </h1>
            {content?.established && (
              <p className="text-brand-cream/60 text-sm font-medium mb-2">Est. {content.established}</p>
            )}
            <div className="flex flex-col items-center text-brand-cream/80 mb-6">
              <div className="flex items-center text-xl">
                <MapPin className="h-5 w-5 mr-2" />
                {processor.location}
              </div>
              {processor.address && (
                <div className="text-sm text-brand-cream/60 mt-1">
                  {processor.address}{processor.zip ? `, ${processor.zip}` : ''}
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {processor.species.map(s => (
                <span key={s} className="bg-white/10 text-white text-sm font-bold px-3 py-1 rounded-full">
                  {s}
                </span>
              ))}
            </div>
            {processor.rating != null && (
              <div className="flex items-center justify-center gap-1.5 text-brand-cream/90 text-sm mb-8">
                <Star className="h-4 w-4 fill-brand-yellow text-brand-yellow" />
                <span className="font-bold">{processor.rating}</span>
                {processor.userRatingCount != null && (
                  <span className="text-brand-cream/60">({processor.userRatingCount} {processor.userRatingCount === 1 ? 'review' : 'reviews'})</span>
                )}
                {processor.businessStatus === 'CLOSED_PERMANENTLY' && (
                  <span className="ml-3 bg-red-500/20 text-red-200 text-xs font-bold px-2 py-0.5 rounded-full">Permanently closed</span>
                )}
                {processor.businessStatus === 'CLOSED_TEMPORARILY' && (
                  <span className="ml-3 bg-amber-500/20 text-amber-200 text-xs font-bold px-2 py-0.5 rounded-full">Temporarily closed</span>
                )}
              </div>
            )}
            {isCustomer ? (
              (() => {
                const facilities = partnerFacilitiesFor(processor);
                if (facilities.length > 1) {
                  return (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      {facilities.map(f => (
                        <a
                          key={f.slug}
                          href={`https://partners.farmshare.co/scheduling/${f.slug}?ref=farmshare-directory`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-brand-orange text-white text-lg px-8 py-4 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center font-bold"
                        >
                          <Calendar className="mr-2 h-5 w-5" />
                          Schedule — {f.label}
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      ))}
                    </div>
                  );
                }
                return (
                  <a
                    href={`https://partners.farmshare.co/scheduling/${facilities[0].slug}?ref=farmshare-directory`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-brand-orange text-white text-lg px-8 py-4 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center font-bold"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Online
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                );
              })()
            ) : (
              <button
                onClick={() => setRequestOpen(true)}
                className="bg-brand-orange text-white text-lg px-8 py-4 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center font-bold"
              >
                <Send className="mr-2 h-5 w-5" />
                Send scheduling request
              </button>
            )}
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
              ) : processor.editorialSummary ? (
                <p className="text-stone-700 mb-6">{processor.editorialSummary}</p>
              ) : processor.description ? (
                <p className="text-stone-700 mb-6">{processor.description}</p>
              ) : (
                <p className="text-stone-700 mb-6">
                  {processor.name} is an independent custom meat processor located in {city ? `${city}, ` : ''}{stateFull}. They process {processor.species.join(', ').replace(/, ([^,]*)$/, ' and $1')}{isCustomer ? ' and offer online scheduling and digital cut sheets through Farmshare' : ''}.
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

              {/* Visit Website / Contact Info */}
              {(content?.website || processor.website || processor.phone || processor.googleMapsUri) && (
                <div className="mb-6 flex flex-wrap gap-2">
                  {(content?.website || processor.website) && (
                    <a
                      href={content?.website || processor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-brand-cream rounded-lg text-brand-green font-medium hover:text-brand-orange transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      Visit Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {!isCustomer && processor.phone && (
                    <a
                      href={`tel:${processor.phone.replace(/[^0-9+]/g, '')}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-brand-cream rounded-lg text-brand-green font-medium hover:text-brand-orange transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      {processor.phone}
                    </a>
                  )}
                  {processor.googleMapsUri && (
                    <a
                      href={processor.googleMapsUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-brand-cream rounded-lg text-brand-green font-medium hover:text-brand-orange transition-colors"
                    >
                      <MapIcon className="h-4 w-4" />
                      View on Google Maps
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Hours */}
              {processor.hours && processor.hours.length > 0 && (
                <div className="mb-6 bg-brand-cream rounded-lg p-4">
                  <div className="flex items-center gap-2 text-brand-green font-bold mb-2">
                    <Clock className="h-4 w-4" />
                    Hours
                  </div>
                  <ul className="text-sm text-stone-700 space-y-0.5">
                    {processor.hours.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}

              {isCustomer ? (
                <>
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
                </>
              ) : (
                <div className="bg-brand-cream rounded-lg p-5 mb-6">
                  <h3 className="text-lg font-bold text-brand-green mb-2">Want to book with {processor.name}?</h3>
                  <p className="text-stone-700 text-sm mb-2">
                    Send us your request and we'll get back to you within 1–2 business days.
                  </p>
                  <p className="text-stone-600 text-sm mb-0">
                    Need to book right now?{' '}
                    <Link to="/find-a-processor?online=true" className="text-brand-green font-semibold hover:underline">
                      See processors with online scheduling →
                    </Link>
                  </p>
                </div>
              )}

              <div className="text-center">
                {isCustomer ? (
                  (() => {
                    const facilities = partnerFacilitiesFor(processor);
                    if (facilities.length > 1) {
                      return (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                          {facilities.map(f => (
                            <a
                              key={f.slug}
                              href={`https://partners.farmshare.co/scheduling/${f.slug}?ref=farmshare-directory`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-brand-orange text-white text-lg px-8 py-4 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center font-bold"
                            >
                              <Calendar className="mr-2 h-5 w-5" />
                              {f.label} dates
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <a
                        href={`https://partners.farmshare.co/scheduling/${facilities[0].slug}?ref=farmshare-directory`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-brand-orange text-white text-lg px-8 py-4 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center font-bold"
                      >
                        <Calendar className="mr-2 h-5 w-5" />
                        View Available Dates
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    );
                  })()
                ) : (
                  <button
                    onClick={() => setRequestOpen(true)}
                    className="bg-brand-orange text-white text-lg px-8 py-4 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center font-bold"
                  >
                    <Send className="mr-2 h-5 w-5" />
                    Send scheduling request
                  </button>
                )}
              </div>
            </div>

            {/* SEO Content */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-roca text-brand-green mb-4">
                Custom Meat Processing in {city ? `${city}, ` : ''}{stateFull}
              </h2>
              <p className="text-stone-700 mb-4">
                Looking for a meat processor {city ? `near ${city}, ${stateFull}` : `in ${stateFull}`}? {processor.name} offers custom {processor.species.join(', ').replace(/, ([^,]*)$/, ' and $1').toLowerCase()} processing{isCustomer ? ' with modern tools that make the experience easier for farmers and ranchers' : ' for farmers and ranchers in the region'}.
              </p>
              {isCustomer ? (
                <p className="text-stone-700 mb-4">
                  Instead of playing phone tag to book a harvest slot, you can schedule online through Farmshare. Submit your cut sheet digitally from your phone—no more handwriting instructions on paper. And you'll get automatic text and email updates on your order status from drop-off to pickup.
                </p>
              ) : (
                <p className="text-stone-700 mb-4">
                  {processor.name} isn't on the Farmshare network yet — bookings still happen by phone or in person. If you'd like to see them offer online scheduling, digital cut sheets, and order updates, request it above and we'll reach out on your behalf.
                </p>
              )}
              <p className="text-stone-700">
                Browse more processors in <Link to={`/find-a-processor/${stateFull.toLowerCase().replace(/\s+/g, '-')}`} className="text-brand-orange font-bold hover:underline">{stateFull}</Link> or view <Link to="/find-a-processor" className="text-brand-orange font-bold hover:underline">all processors</Link> in the Farmshare network.
              </p>
            </div>
          </div>
        </div>
      </section>

      <RequestSchedulingModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        processorSlug={processor.slug}
        processorName={processor.name}
      />
    </div>
  );
}
