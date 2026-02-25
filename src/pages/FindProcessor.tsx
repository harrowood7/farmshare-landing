import React, { useEffect, useState } from 'react';
import { MapPin, Search, Calendar, Filter, ChevronDown, ExternalLink } from 'lucide-react';

// Real processor directory data from partners.farmshare.co/scheduling
// Last updated: Feb 2026
const processors = [
  {
    name: "D&D Meats",
    location: "Celina, TN",
    state: "TN",
    species: ["Beef", "Hog", "Lamb", "Goat"],
    logo: "https://static.wixstatic.com/media/9e2732_cc5da98b2b734b10bec1f236cfc03c47~mv2.png",
    slug: "d-d-meats-celina-tn",
  },

  {
    name: "Chipola Meats",
    location: "Graceville, FL",
    state: "FL",
    species: ["Beef", "Hog", "Lamb", "Goat"],
    logo: null,
    slug: "chipola-meats-graceville-fl",
  },
  {
    name: "Homeplace Pastures",
    location: "Como, MS",
    state: "MS",
    species: ["Beef", "Hog"],
    logo: "https://homeplacepastures.com/cdn/shop/files/HPP-PRIMARY-BLK_4x_1a9da2dd-8f0e-4df3-8687-b4f4b6f4a07a.png",
    slug: "homeplace-pastures-como-ms",
  },
  {
    name: "The Butcher's Block",
    location: "Dry Fork, VA",
    state: "VA",
    species: ["Beef", "Hog", "Lamb", "Goat"],
    logo: "https://www.butchersblockva.com/mt-content/uploads/2020/11/thumbnails/butchers-block-black-grunge_m_264x300.png",
    slug: "the-butchers-block-dry-fork-va",
  },
  {
    name: "Heartquist Hollow Farm",
    location: "Winkelman, AZ",
    state: "AZ",
    species: ["Beef", "Hog", "Lamb", "Goat"],
    logo: "https://images.squarespace-cdn.com/content/v1/6711142d87ff566185eee106/9eb095b0-ec1f-4181-b6e8-1b79bde3e37c/Logo.png",
    slug: "heartquist-hollow-farm-winkelman-az",
  },
  {
    name: "Rocky Mountain Meats",
    location: "Hesperus, CO",
    state: "CO",
    species: ["Beef"],
    logo: "/logos/rocky-mountain-meats.png",
    slug: "rocky-mountain-meats-hesperus-co",
  },
  {
    name: "Sunnyside Meats",
    location: "Durango, CO",
    state: "CO",
    species: ["Beef", "Hog", "Lamb", "Goat"],
    logo: "https://sunnysidemeats.com/wp-content/uploads/2021/08/sunnyside-meats-logo.svg",
    slug: "sunnyside-meats-durango-co",
  },

  {
    name: "Adams Farm Slaughterhouse",
    location: "Athol, MA",
    state: "MA",
    species: ["Beef", "Hog", "Bison", "Lamb", "Goat", "Veal"],
    logo: "https://assets.partners.farmshare.co/tenant-689b8a950ff9f81e4e3bef98/images/1769017018196-adams_farm_logo.jpg",
    slug: "adams-farm-slaughterhouse-llc-athol-ma",
  },
  {
    name: "CuttinUp Meat Processing",
    location: "Leeton, MO",
    state: "MO",
    species: ["Beef", "Hog", "Bison", "Lamb", "Goat", "Venison"],
    logo: "https://static.spotapps.co/website_images/ab_websites/178860_website/logo.png",
    slug: "cuttinup-meat-processing-leeton-mo",
  },
  {
    name: "Beef & Bacon",
    location: "Calhoun, KY",
    state: "KY",
    species: ["Beef", "Hog"],
    logo: "/logos/beef-and-bacon.jpg",
    slug: "beef-bacon-calhoun-ky",
  },
  {
    name: "Flint Packers",
    location: "Andersonville, GA",
    state: "GA",
    species: ["Beef", "Hog"],
    logo: "/logos/flint-packers.webp",
    slug: "flint-packers-andersonville-ga",
  },
  {
    name: "Westcliffe Meats",
    location: "Westcliffe, CO",
    state: "CO",
    species: ["Beef", "Hog", "Bison", "Lamb", "Goat", "Venison", "Yak"],
    logo: "https://static.wixstatic.com/media/a84f87_0b8859e14123477186d7198c77da800b~mv2.jpg",
    slug: "westcliffe-meats-westcliffe-co",
  },
  {
    name: "Dayton Meat Products",
    location: "Malcom, IA",
    state: "IA",
    species: ["Beef", "Hog"],
    logo: "https://assets.partners.farmshare.co/tenant-697261470737d7cb9c32e977/images/1770928926064-dayton_logo.jpg",
    slug: "dayton-meat-products-malcom-ia",
  },
  {
    name: "Royal Butcher",
    location: "Braintree, VT",
    state: "VT",
    species: ["Beef", "Hog", "Lamb", "Goat"],
    logo: "/logos/royal-butcher.png",
    slug: "royal-butcher-braintree-vt",
  },
  {
    name: "Mountain View Custom Meats",
    location: "Coeur D'Alene, ID",
    state: "ID",
    species: ["Beef", "Hog", "Lamb", "Goat"],
    logo: "https://images.squarespace-cdn.com/content/v1/551fee88e4b06ebe901264ea/b1442d9d-890a-482d-955a-7a8b4a861b35/MVCM+Beef+Logo.png",
    slug: "mountain-view-custom-meats-coeur-dalene-id",
  },
  {
    name: "Pelkin's Smokey Meat Market",
    location: "Crivitz, WI",
    state: "WI",
    species: ["Beef", "Hog", "Bison", "Lamb", "Goat"],
    logo: "/logos/pelkins.webp",
    slug: "pelkins-smokey-meat-market-crivitz-wi",
  },
  {
    name: "Potts Meats",
    location: "Wartrace, TN",
    state: "TN",
    species: ["Beef", "Hog"],
    logo: "/logos/potts.png",
    slug: "potts-meats-wartrace-tn",
  },
  {
    name: "6 in 1 Meats",
    location: "New Salem, ND",
    state: "ND",
    species: ["Beef", "Hog", "Lamb", "Goat"],
    logo: "https://6in1meats.com/wp-content/uploads/2020/12/FINAL-LOGOS-6-in-1-meats_mai-logo-white-300x146.webp",
    slug: "6-in-1-meats-new-salem-nd",
  },
  {
    name: "Rawhide Meats",
    location: "White Sulphur Springs, MT",
    state: "MT",
    species: ["Beef", "Hog", "Bison", "Lamb"],
    logo: "/logos/rawhide.jpg",
    slug: "rawhide-meats-white-sulphur-springs-mt",
  },
  {
    name: "Follett's Meat Co.",
    location: "Hermiston, OR",
    state: "OR",
    species: ["Beef", "Hog"],
    logo: null,
    slug: "folletts-meat-co-hermiston-or",
  },
  {
    name: "Weimer Meats — Custom",
    location: "New Alexandria, PA",
    state: "PA",
    species: ["Beef", "Hog", "Lamb", "Goat"],
    logo: "/logos/weimer.jpg",
    slug: "weimer-meats-custom-new-alexandria-pa",
  },
  {
    name: "Simla Foods",
    location: "Simla, CO",
    state: "CO",
    species: ["Beef", "Hog", "Lamb", "Goat"],
    logo: "https://simlafoods.com/wp-content/uploads/2020/05/logo.jpg",
    slug: "simla-foods-simla-co",
  },
  {
    name: "Butcher Bros",
    location: "Rushville, IN",
    state: "IN",
    species: ["Beef"],
    logo: "/logos/butcher-bros.jpg",
    slug: "butcher-bros-rushville-in",
  },
  {
    name: "Beaverhead Meats",
    location: "Dillon, MT",
    state: "MT",
    species: ["Beef", "Hog", "Bison", "Lamb", "Goat"],
    logo: "https://assets.partners.farmshare.co/tenant-6859978032f088d596ae2a8e/images/1768430986914-newlogo.jpg",
    slug: "beaverhead-meats-dillon-mt",
  },
  {
    name: "Weimer Meats — USDA",
    location: "New Alexandria, PA",
    state: "PA",
    species: ["Beef", "Hog", "Lamb", "Goat"],
    logo: "/logos/weimer.jpg",
    slug: "weimer-meats-usda-new-alexandria-pa",
  },
];

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

  }, []);

  const allSpecies = ["All Species", ...Array.from(new Set(processors.flatMap(p => p.species))).sort()];

  const filtered = processors.filter(p => {
    const matchesSearch = searchQuery === '' || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.state.toLowerCase().includes(searchQuery.toLowerCase());
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
                <a
                  key={index}
                  href={`https://partners.farmshare.co/scheduling/${processor.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
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
                      <ExternalLink className="h-4 w-4 text-brand-green group-hover:text-brand-orange transition-colors" />
                    </div>
                  </div>
                </a>
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
