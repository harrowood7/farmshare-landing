import React, { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { MapPin, Calendar, ArrowLeft, ExternalLink } from 'lucide-react';
import { processors, stateNames, stateSlugToAbbr } from '../data/processors';

export default function StatePage() {
  const { stateSlug } = useParams<{ stateSlug: string }>();
  const stateAbbr = stateSlug ? stateSlugToAbbr[stateSlug] : undefined;
  const stateFull = stateAbbr ? stateNames[stateAbbr] : undefined;
  const stateProcessors = stateAbbr ? processors.filter(p => p.state === stateAbbr) : [];

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
                        <Calendar className="h-4 w-4 mr-2 text-brand-orange" />
                        <span>Online scheduling available</span>
                      </div>
                      <ExternalLink className="h-4 w-4 text-brand-green group-hover:text-brand-orange transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

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
