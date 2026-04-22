import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { MapPin, Calendar, ArrowLeft, ExternalLink, Map as MapIcon, List, Navigation, X } from 'lucide-react';
import { processors, stateNames, stateSlugToAbbr } from '../data/processors';
import ProcessorMap from '../components/ProcessorMap';
import { useUserLocation, distanceMiles } from '../hooks/useUserLocation';

export default function StatePage() {
  const { stateSlug } = useParams<{ stateSlug: string }>();
  const stateAbbr = stateSlug ? stateSlugToAbbr[stateSlug] : undefined;
  const stateFull = stateAbbr ? stateNames[stateAbbr] : undefined;
  const stateProcessorsRaw = stateAbbr ? processors.filter(p => p.state === stateAbbr) : [];
  const [view, setView] = useState<'list' | 'map'>('list');
  const userLoc = useUserLocation();
  const stateProcessors = userLoc.location
    ? [...stateProcessorsRaw].sort((a, b) => {
        const ad = a.lat != null && a.lng != null
          ? distanceMiles(userLoc.location!, { lat: a.lat, lng: a.lng })
          : Infinity;
        const bd = b.lat != null && b.lng != null
          ? distanceMiles(userLoc.location!, { lat: b.lat, lng: b.lng })
          : Infinity;
        return ad - bd;
      })
    : stateProcessorsRaw;

  useEffect(() => {
    if (!stateFull) return;

    document.title = `Custom Meat Processors in ${stateFull} | Farmshare`;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content',
        `Find ${stateProcessors.length} custom meat processor${stateProcessors.length !== 1 ? 's' : ''} in ${stateFull} on Farmshare. Book harvest appointments online, submit digital cut sheets, and track your order.`
      );
    }

    // Inject ItemList structured data
    const existingScript = document.querySelector('#state-schema');
    if (existingScript) existingScript.remove();

    const schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `Custom Meat Processors in ${stateFull}`,
      "description": `Directory of independent custom meat processors in ${stateFull} offering online scheduling through Farmshare.`,
      "numberOfItems": stateProcessors.length,
      "itemListElement": stateProcessors.map((p, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "item": {
          "@type": "LocalBusiness",
          "name": p.name,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": p.location.split(',')[0].trim(),
            "addressRegion": stateFull,
            "addressCountry": "US"
          },
          "url": `https://farmshare.co/find-a-processor/${p.slug}`
        }
      }))
    };

    const script = document.createElement('script');
    script.id = 'state-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const el = document.querySelector('#state-schema');
      if (el) el.remove();
    };
  }, [stateFull, stateProcessors]);

  if (!stateFull || stateProcessors.length === 0) {
    return <Navigate to="/find-a-processor" replace />;
  }

  // Collect all species in this state
  const allSpecies = Array.from(new Set(stateProcessors.flatMap(p => p.species))).sort();

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-brand-green">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight text-white font-roca tracking-tight">
              Meat Processors in {stateFull}
            </h1>
            <p className="text-xl text-brand-cream/80 mb-4 font-medium">
              {stateProcessors.length} independent processor{stateProcessors.length !== 1 ? 's' : ''} in {stateFull} offering online scheduling through Farmshare.
            </p>
            <p className="text-brand-cream/60">
              Species available: {allSpecies.join(', ')}
            </p>
          </div>
        </div>
      </section>

      {/* Processors */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Link
              to="/find-a-processor"
              className="inline-flex items-center text-brand-green font-medium hover:text-brand-orange transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              All Processors
            </Link>

            {/* View + Near me controls */}
            <div className="flex flex-wrap justify-end gap-3 mb-6">
              {userLoc.location ? (
                <button
                  onClick={userLoc.clear}
                  className="flex items-center gap-1.5 px-3 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-colors"
                >
                  <Navigation className="h-4 w-4" />
                  Sorted by distance
                  <X className="h-3.5 w-3.5 ml-1" />
                </button>
              ) : (
                <button
                  onClick={userLoc.request}
                  disabled={userLoc.loading}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-stone-200 text-stone-700 rounded-lg text-sm font-medium hover:text-brand-green transition-colors disabled:opacity-60"
                >
                  <Navigation className="h-4 w-4" />
                  {userLoc.loading ? 'Locating…' : 'Near me'}
                </button>
              )}

              <div className="flex bg-white rounded-lg border border-stone-200 p-1">
                <button
                  onClick={() => setView('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === 'list' ? 'bg-brand-green text-white' : 'text-stone-600 hover:text-brand-green'}`}
                >
                  <List className="h-4 w-4" />
                  List
                </button>
                <button
                  onClick={() => setView('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === 'map' ? 'bg-brand-green text-white' : 'text-stone-600 hover:text-brand-green'}`}
                >
                  <MapIcon className="h-4 w-4" />
                  Map
                </button>
              </div>
            </div>

            {userLoc.error && (
              <p className="text-sm text-red-600 mb-4">{userLoc.error}</p>
            )}

            {view === 'map' && (
              <div className="mb-12">
                <ProcessorMap processors={stateProcessors} userLocation={userLoc.location} maxZoomOnFit={8} />
              </div>
            )}

            {view === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {stateProcessors.map((processor, index) => (
                <Link
                  key={index}
                  to={`/find-a-processor/${processor.slug}`}
                  className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden block"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {processor.logo ? (
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-brand-cream flex items-center justify-center overflow-hidden p-1">
                          <img
                            src={processor.logo}
                            alt={processor.name}
                            className="max-w-full max-h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-brand-green flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {processor.name.split(' ').map(w => w[0]).filter(c => c && c.match(/[A-Z0-9]/i)).slice(0, 2).join('').toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold text-brand-green leading-tight group-hover:text-brand-orange transition-colors">{processor.name}</h2>
                        <div className="flex items-center text-stone-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="text-sm">{processor.location}</span>
                          {userLoc.location && processor.lat != null && processor.lng != null && (
                            <span className="text-xs text-brand-green font-semibold ml-2">
                              {Math.round(distanceMiles(userLoc.location, { lat: processor.lat, lng: processor.lng }))} mi
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {processor.species.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {processor.species.map(s => (
                          <span key={s} className="bg-brand-orange/10 text-brand-orange text-xs font-bold px-2 py-1 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm bg-brand-cream rounded-lg px-3 py-2">
                      <div className="flex items-center text-stone-600">
                        {processor.status === 'customer' ? (
                          <>
                            <Calendar className="h-4 w-4 mr-2 text-brand-orange" />
                            <span>Online scheduling available</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4 mr-2 text-brand-green" />
                            <span>Independent processor</span>
                          </>
                        )}
                      </div>
                      <ExternalLink className="h-4 w-4 text-brand-green group-hover:text-brand-orange transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            )}

            {/* SEO Content */}
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl font-roca text-brand-green mb-4">
                Custom Meat Processing in {stateFull}
              </h2>
              <div className="space-y-4 text-stone-700">
                <p>
                  Farmshare connects you with {stateProcessors.length} independent custom meat processor{stateProcessors.length !== 1 ? 's' : ''} in {stateFull}. Whether you're a rancher, farmer, or hunter, finding a reliable processor near you doesn't have to be difficult.
                </p>
                <p>
                  Every processor on the Farmshare network in {stateFull} offers online scheduling—book your harvest slot from your phone instead of calling. Submit your cut sheet digitally and get automatic text and email updates on your order status.
                </p>
                <p>
                  Click on any processor above to learn more and view available dates, or <Link to="/find-a-processor" className="text-brand-orange font-bold hover:underline">browse all processors</Link> across the country.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-roca text-brand-green mb-4">Are You a Processor in {stateFull}?</h2>
            <p className="text-xl text-stone-600 mb-8">
              Join the Farmshare network and let producers in {stateFull} find you. Get listed in our directory, offer online scheduling, and grow your customer base.
            </p>
            <a
              href="https://meetings.hubspot.com/henry-arrowood/quad-p-demo"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-brand-orange text-white text-lg px-8 py-4 rounded-lg hover:bg-brand-yellow transition-colors inline-flex items-center font-bold"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Schedule a Demo
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
