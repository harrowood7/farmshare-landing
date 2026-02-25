import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, Calendar, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { processors, stateNames } from '../data/processors';

// Derive unique states sorted alphabetically
const allStates = ["All States", ...Array.from(new Set(processors.map(p => p.state))).sort()];

export default function FindProcessor() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedSpecies, setSelectedSpecies] = useState('All Species');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    document.title = 'Find a Custom Meat Processor Near You | Farmshare';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Find a trusted, independent custom meat processor near you. Browse Farmshare\'s nationwide directory of processors offering online scheduling, digital cut sheets, and more.');
    }

    // JSON-LD ItemList schema for the full directory
    const existingScript = document.querySelector('#directory-schema');
    if (existingScript) existingScript.remove();

    const schema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Custom Meat Processor Directory",
      "description": "Nationwide directory of independent custom meat processors offering online scheduling through Farmshare.",
      "numberOfItems": processors.length,
      "itemListElement": processors.map((p, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "item": {
          "@type": "LocalBusiness",
          "name": p.name,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": p.location.split(',')[0].trim(),
            "addressRegion": stateNames[p.state] || p.state,
            "addressCountry": "US"
          },
          "url": `https://farmshare.co/find-a-processor/${p.slug}`
        }
      }))
    };

    const script = document.createElement('script');
    script.id = 'directory-schema';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const el = document.querySelector('#directory-schema');
      if (el) el.remove();
    };
  }, []);

  const allSpecies = ["All Species", ...Array.from(new Set(processors.flatMap(p => p.species))).sort()];

  const filtered = processors.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' ||
      p.name.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.state.toLowerCase().includes(q) ||
      (stateNames[p.state]?.toLowerCase().includes(q) ?? false);
    const matchesState = selectedState === 'All States' || p.state === selectedState;
    const matchesSpecies = selectedSpecies === 'All Species' || p.species.includes(selectedSpecies);
    return matchesSearch && matchesState && matchesSpecies;
  });

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-brand-green">
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight text-white font-roca tracking-tight">
              Find a Processor Near You
            </h1>
            <p className="text-xl text-brand-cream/80 mb-8 font-medium">
              Browse our nationwide network of independent meat processors. Every processor on Farmshare offers online scheduling and digital cut sheets—so you can book, customize, and track your order from your phone.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input
                type="text"
                placeholder="Search by name, city, or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-lg bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-orange shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters + Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
              <p className="text-stone-600 font-medium">
                Showing <span className="text-brand-green font-bold">{filtered.length}</span> processor{filtered.length !== 1 ? 's' : ''}
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-stone-200 text-stone-700 font-medium"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                <div className={`${showFilters ? 'flex' : 'hidden'} md:flex flex-wrap gap-3`}>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="px-4 py-2 bg-white rounded-lg border border-stone-200 text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange cursor-pointer"
                  >
                    {allStates.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>

                  <select
                    value={selectedSpecies}
                    onChange={(e) => setSelectedSpecies(e.target.value)}
                    className="px-4 py-2 bg-white rounded-lg border border-stone-200 text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange cursor-pointer"
                  >
                    {allSpecies.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Processor Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((processor, index) => (
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
                            decoding="async"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.className = "flex-shrink-0 w-16 h-16 rounded-lg bg-brand-green flex items-center justify-center";
                                parent.innerHTML = `<span class="text-white font-bold text-xl">${processor.name.split(' ').map(w => w[0]).filter(c => c && c.match(/[A-Z0-9]/i)).slice(0, 2).join('').toUpperCase()}</span>`;
                              }
                            }}
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
                        <h3 className="text-lg font-bold text-brand-green leading-tight group-hover:text-brand-orange transition-colors">{processor.name}</h3>
                        <div className="flex items-center text-stone-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="text-sm">{processor.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Species Tags */}
                    {processor.species.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {processor.species.map(s => (
                          <span key={s} className="bg-brand-orange/10 text-brand-orange text-xs font-bold px-2 py-1 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    <div className="flex items-center justify-between text-sm bg-brand-cream rounded-lg px-3 py-2">
                      <div className="flex items-center text-stone-600">
                        <Calendar className="h-4 w-4 mr-2 text-brand-orange" />
                        <span>Online scheduling available</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-brand-green group-hover:text-brand-orange transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-stone-500 mb-4">No processors found matching your search.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedState('All States'); setSelectedSpecies('All Species'); }}
                  className="text-brand-orange font-bold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA for Processors */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-roca text-brand-green mb-4">Are You a Processor?</h2>
            <p className="text-xl text-stone-600 mb-8">
              Join the Farmshare network and let producers find you. Get listed in our directory, offer online scheduling, and grow your customer base.
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

      {/* SEO Content */}
      <section className="py-16 bg-brand-cream">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-roca text-brand-green mb-6">How to Find the Right Custom Meat Processor</h2>
            <div className="space-y-4 text-stone-700">
              <p>
                Whether you're a rancher looking to process your own cattle, a small farm selling direct-to-consumer, or a hunter with venison to process—finding the right custom meat processor matters. Farmshare's directory connects you with trusted, independent processors across the United States who use modern tools to make the entire experience easier.
              </p>
              <p>
                Every processor on the Farmshare network offers online scheduling, so you can book your harvest slot from your phone instead of playing phone tag. You'll also be able to submit your cut sheet digitally—no more handwriting instructions on paper or faxing forms. And you'll get automatic text and email updates on your order status, from drop-off to pickup.
              </p>
              <p>
                Use the search and filters above to find processors by location or species. Click on any processor card to view their scheduling page, check available dates, and book your slot directly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
