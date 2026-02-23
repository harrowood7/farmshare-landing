import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Globe, Search, Calendar, Filter, ChevronDown } from 'lucide-react';

// Processor directory data — processors on the Farmshare network
// These can eventually be pulled from Supabase
const processors = [
  {
    name: "The Butcher's Block",
    location: "Weatherford, TX",
    state: "TX",
    region: "South",
    services: ["Beef", "Pork", "Lamb"],
    logo: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/the%20butchers%20block%20logo%20(1).jpg",
    usda: true,
    scheduling: true,
  },
  {
    name: "Gore's Meat",
    location: "Akron, OH",
    state: "OH",
    region: "Midwest",
    services: ["Beef", "Pork", "Venison"],
    logo: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/Gores_Meat_Logo.svg",
    usda: true,
    scheduling: true,
  },
  {
    name: "Bringhurst Meats",
    location: "Bringhurst, IN",
    state: "IN",
    region: "Midwest",
    services: ["Beef", "Pork", "Lamb"],
    logo: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/bringhurst%20logo.png",
    usda: false,
    scheduling: true,
  },
  {
    name: "Heartquist Hollow",
    location: "Enterprise, OR",
    state: "OR",
    region: "West",
    services: ["Beef", "Pork", "Lamb", "Goat"],
    logo: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/heartquist%20hollow%20logo.png",
    usda: true,
    scheduling: true,
  },
  {
    name: "D&D Custom Meats",
    location: "Eldon, MO",
    state: "MO",
    region: "Midwest",
    services: ["Beef", "Pork", "Venison"],
    logo: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/d&d%20logo.png",
    usda: false,
    scheduling: true,
  },
  {
    name: "Heritage Prairie Processing",
    location: "Congerville, IL",
    state: "IL",
    region: "Midwest",
    services: ["Beef", "Pork"],
    logo: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/HPP%20logo.avif",
    usda: true,
    scheduling: true,
  },
  {
    name: "Hurdwell Meats",
    location: "Canton, OH",
    state: "OH",
    region: "Midwest",
    services: ["Beef", "Pork", "Lamb"],
    logo: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/hurdwell-logo.png",
    usda: false,
    scheduling: true,
  },
  {
    name: "Johnson's Custom Processing",
    location: "Rice, TX",
    state: "TX",
    region: "South",
    services: ["Beef", "Pork", "Venison", "Exotics"],
    logo: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/johnson's%20logo.webp",
    usda: false,
    scheduling: true,
  },
  {
    name: "Lone Crow Meats",
    location: "Hermiston, OR",
    state: "OR",
    region: "West",
    services: ["Beef", "Pork"],
    logo: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/lone%20crow%20logo%20(1).jpg",
    usda: true,
    scheduling: true,
  },
  {
    name: "Nadler's Meats",
    location: "Hazelton, ND",
    state: "ND",
    region: "Midwest",
    services: ["Beef", "Pork", "Bison"],
    logo: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/Nadler's%20logo.avif",
    usda: true,
    scheduling: true,
  },
  {
    name: "Renick Custom Meats",
    location: "Renick, WV",
    state: "WV",
    region: "South",
    services: ["Beef", "Pork", "Lamb", "Goat"],
    logo: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/renick%20logo%20(1).jpg",
    usda: false,
    scheduling: true,
  },
  {
    name: "Rocky Mountain Natural Meats",
    location: "Henderson, CO",
    state: "CO",
    region: "West",
    services: ["Beef", "Pork", "Bison", "Lamb"],
    logo: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/rocky%20mountain%20logo%20(1).jpg",
    usda: true,
    scheduling: true,
  },
  {
    name: "Sunnyside Meats",
    location: "Sunnyside, WA",
    state: "WA",
    region: "West",
    services: ["Beef", "Pork", "Lamb"],
    logo: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/sunnyside-meats-logo.svg",
    usda: true,
    scheduling: true,
  },
  {
    name: "Westcliffe Custom Meats",
    location: "Westcliffe, CO",
    state: "CO",
    region: "West",
    services: ["Beef", "Pork", "Lamb", "Goat"],
    logo: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/westcliffe%20logo.avif",
    usda: false,
    scheduling: true,
  },
  {
    name: "Willie Joe's BBQ & Processing",
    location: "Mineola, TX",
    state: "TX",
    region: "South",
    services: ["Beef", "Pork"],
    logo: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/willie%20joe's%20logo.webp",
    usda: false,
    scheduling: true,
  },
  {
    name: "ZK Ranches",
    location: "Willcox, AZ",
    state: "AZ",
    region: "West",
    services: ["Beef"],
    logo: "https://vkxvwmvlkitrcfgzwvtl.supabase.co/storage/v1/object/public/content/customer_logos/zk%20logo.avif",
    usda: false,
    scheduling: true,
  },
  {
    name: "Prairie Valley Meats",
    location: "Hoven, SD",
    state: "SD",
    region: "Midwest",
    services: ["Beef", "Pork", "Bison"],
    logo: null,
    usda: true,
    scheduling: true,
  },
];

const regions = ["All Regions", "Midwest", "South", "West"];

export default function FindProcessor() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [selectedSpecies, setSelectedSpecies] = useState('All Species');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    document.title = 'Find a Custom Meat Processor Near You | Farmshare';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Find a trusted, independent custom meat processor near you. Browse Farmshare\'s nationwide directory of USDA-inspected and state-inspected processors offering online scheduling, digital cut sheets, and more.');
    }

    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, observerOptions);
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const allSpecies = ["All Species", ...Array.from(new Set(processors.flatMap(p => p.services))).sort()];

  const filtered = processors.filter(p => {
    const matchesSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.state.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'All Regions' || p.region === selectedRegion;
    const matchesSpecies = selectedSpecies === 'All Species' || p.services.includes(selectedSpecies);
    return matchesSearch && matchesRegion && matchesSpecies;
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
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="px-4 py-2 bg-white rounded-lg border border-stone-200 text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange cursor-pointer"
                  >
                    {regions.map(r => <option key={r} value={r}>{r}</option>)}
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
                <div 
                  key={index} 
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden fade-up"
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
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-brand-green flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {processor.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-brand-green leading-tight">{processor.name}</h3>
                        <div className="flex items-center text-stone-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                          <span className="text-sm">{processor.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {processor.usda && (
                        <span className="bg-brand-green/10 text-brand-green text-xs font-bold px-2 py-1 rounded-full">
                          USDA Inspected
                        </span>
                      )}
                      {!processor.usda && (
                        <span className="bg-stone-100 text-stone-600 text-xs font-bold px-2 py-1 rounded-full">
                          State Inspected
                        </span>
                      )}
                      {processor.services.map(s => (
                        <span key={s} className="bg-brand-orange/10 text-brand-orange text-xs font-bold px-2 py-1 rounded-full">
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Farmshare Features */}
                    {processor.scheduling && (
                      <div className="flex items-center text-sm text-stone-600 bg-brand-cream rounded-lg px-3 py-2">
                        <Calendar className="h-4 w-4 mr-2 text-brand-orange" />
                        <span>Online scheduling & digital cut sheets available</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-xl text-stone-500 mb-4">No processors found matching your search.</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedRegion('All Regions'); setSelectedSpecies('All Species'); }}
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
                Use the search and filters above to find processors by location, species, or inspection type. Whether you need USDA-inspected processing for wholesale or state-inspected custom exempt for your personal use, we can help you find the right fit.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
