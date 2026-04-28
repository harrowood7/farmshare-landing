import React, { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Search, Calendar, Filter, ChevronDown, ChevronRight, Map as MapIcon, List, Navigation, X, CheckCircle2, Send } from 'lucide-react';
import { processors, stateNames, type Processor } from '../data/processors';
import ProcessorMap from '../components/ProcessorMap';
import { useUserLocation, distanceMiles } from '../hooks/useUserLocation';

// Derive unique states sorted alphabetically
const allStates = ["All States", ...Array.from(new Set(processors.map(p => p.state))).sort()];

function initialsFor(name: string): string {
  return name.split(' ').map(w => w[0]).filter(c => c && c.match(/[A-Z0-9]/i)).slice(0, 2).join('').toUpperCase();
}

function ProcessorLogo({ processor }: { processor: Processor }) {
  const [failed, setFailed] = useState(false);
  if (!processor.logo || failed) {
    return (
      <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-brand-green flex items-center justify-center">
        <span className="text-white font-bold text-xl">{initialsFor(processor.name)}</span>
      </div>
    );
  }
  return (
    <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-brand-cream flex items-center justify-center overflow-hidden p-1">
      <img
        src={processor.logo}
        alt={processor.name}
        className="max-w-full max-h-full object-contain"
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export default function FindProcessor() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedSpecies, setSelectedSpecies] = useState('All Species');
  const [onlineOnly, setOnlineOnly] = useState(searchParams.get('online') === 'true');
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<'list' | 'map'>('map');
  const PAGE_SIZE = 24;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Keep URL in sync when user toggles the filter so the state is shareable.
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (onlineOnly) next.set('online', 'true');
    else next.delete('online');
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [onlineOnly, searchParams, setSearchParams]);
  const userLoc = useUserLocation();

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

  const filteredRaw = processors.filter(p => {
    if (p.businessStatus === 'CLOSED_PERMANENTLY') return false;
    const q = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' ||
      p.name.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.state.toLowerCase().includes(q) ||
      (stateNames[p.state]?.toLowerCase().includes(q) ?? false);
    const matchesState = selectedState === 'All States' || p.state === selectedState;
    const matchesSpecies = selectedSpecies === 'All Species' || p.species.includes(selectedSpecies);
    const matchesOnline = !onlineOnly || p.status === 'customer';
    return matchesSearch && matchesState && matchesSpecies && matchesOnline;
  });

  const filtered = userLoc.location
    ? [...filteredRaw].sort((a, b) => {
        const ad = a.lat != null && a.lng != null
          ? distanceMiles(userLoc.location!, { lat: a.lat, lng: a.lng })
          : Infinity;
        const bd = b.lat != null && b.lng != null
          ? distanceMiles(userLoc.location!, { lat: b.lat, lng: b.lng })
          : Infinity;
        return ad - bd;
      })
    : filteredRaw;

  // Reset pagination whenever filters/search/sort change.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, selectedState, selectedSpecies, onlineOnly, userLoc.location]);

  // Infinite scroll: bump visibleCount when sentinel enters viewport.
  useEffect(() => {
    if (view !== 'list') return;
    const node = sentinelRef.current;
    if (!node) return;
    if (visibleCount >= filtered.length) return;

    const io = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setVisibleCount(c => Math.min(c + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: '600px 0px' }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [view, visibleCount, filtered.length]);

  const visible = filtered.slice(0, visibleCount);

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

      {/* Buyer CTA Banner */}
      <div className="bg-brand-green/5">
        <div className="container mx-auto px-4 py-3">
          <Link
            to="/buy-beef"
            className="flex items-center justify-center gap-2 text-sm font-medium text-brand-green hover:text-brand-green/80 transition-colors"
          >
            <span>🥩</span>
            <span>Looking to buy a quarter, half, or whole? <span className="underline">Tell us what you need →</span></span>
          </Link>
        </div>
      </div>

      {/* Filters + Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
              <p className="text-stone-600 font-medium">
                Showing <span className="text-brand-green font-bold">{filtered.length}</span> processor{filtered.length !== 1 ? 's' : ''}
              </p>

              <div className="flex flex-wrap gap-3 items-center">
                {/* Near me */}
                {userLoc.location ? (
                  <button
                    onClick={userLoc.clear}
                    className="flex items-center gap-1.5 px-3 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green/90 transition-colors"
                    title="Clear location"
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

                {/* View toggle */}
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
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="md:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-stone-200 text-stone-700 font-medium"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                <div className={`${showFilters ? 'flex' : 'hidden'} md:flex flex-wrap gap-3`}>
                  <button
                    type="button"
                    onClick={() => setOnlineOnly(v => !v)}
                    aria-pressed={onlineOnly}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      onlineOnly
                        ? 'bg-brand-green text-white border-brand-green'
                        : 'bg-white text-stone-700 border-stone-200 hover:text-brand-green'
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Online scheduling only
                  </button>

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

            {/* Map View */}
            {view === 'map' && <ProcessorMap processors={filtered} userLocation={userLoc.location} />}

            {userLoc.error && (
              <p className="text-sm text-red-600 mb-4">{userLoc.error}</p>
            )}

            {/* Processor Grid */}
            {view === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((processor, index) => (
                <Link
                  key={index}
                  to={`/find-a-processor/${processor.slug}`}
                  className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden flex flex-col h-full"
                >
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <ProcessorLogo processor={processor} />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-brand-green leading-tight group-hover:text-brand-orange transition-colors">{processor.name}</h3>
                        <div className="flex items-center text-stone-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="text-sm">{processor.location}</span>
                          {userLoc.location && processor.lat != null && processor.lng != null && (
                            <span className="text-xs text-brand-green font-semibold ml-2">
                              {Math.round(distanceMiles(userLoc.location, { lat: processor.lat, lng: processor.lng }))} mi
                            </span>
                          )}
                        </div>
                        {processor.status === 'customer' && (
                          <div className="flex items-center gap-1 text-xs font-semibold text-brand-green mt-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Online scheduling</span>
                          </div>
                        )}
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
                    {processor.status === 'customer' ? (
                      <div className="mt-auto flex items-center justify-between text-sm bg-brand-green rounded-lg px-3 py-2 shadow-sm group-hover:bg-brand-green/90 transition-colors">
                        <div className="flex items-center font-semibold text-white">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Book now — real-time availability</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="mt-auto flex items-center justify-between text-sm bg-stone-100 rounded-lg px-3 py-2">
                        <div className="flex items-center text-stone-600">
                          <Send className="h-4 w-4 mr-2" />
                          <span>Send scheduling request</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-stone-400 group-hover:text-brand-orange transition-colors" />
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            )}

            {view === 'list' && visibleCount < filtered.length && (
              <div ref={sentinelRef} className="flex justify-center py-8">
                <div className="h-6 w-6 border-2 border-brand-green/30 border-t-brand-green rounded-full animate-spin" />
              </div>
            )}

            {filtered.length === 0 && view === 'list' && (
              <div className="text-center py-16">
                <p className="text-xl text-stone-500 mb-4">No processors found matching your search.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedState('All States'); setSelectedSpecies('All Species'); setOnlineOnly(false); }}
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
