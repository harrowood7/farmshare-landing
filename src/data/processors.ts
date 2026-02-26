// Shared processor directory data — used across FindProcessor, ProcessorDetail, and StatePage
// Source: partners.farmshare.co/scheduling | Last updated: Feb 2026

export interface Processor {
  name: string;
  location: string;
  state: string;
  species: string[];
  logo: string | null;
  slug: string;
}

export const processors: Processor[] = [
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
    logo: "/logos/chipola.avif",
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
    logo: "/logos/6-in-1-meats.jpg",
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

// State abbreviation to full name lookup
export const stateNames: Record<string, string> = {
  AZ: "Arizona",
  CO: "Colorado",
  FL: "Florida",
  GA: "Georgia",
  IA: "Iowa",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  KY: "Kentucky",
  MA: "Massachusetts",
  MO: "Missouri",
  MS: "Mississippi",
  MT: "Montana",
  ND: "North Dakota",
  OR: "Oregon",
  PA: "Pennsylvania",
  TN: "Tennessee",
  VA: "Virginia",
  VT: "Vermont",
  WI: "Wisconsin",
};

// Reverse lookup: full name (lowercase) -> abbreviation
export const stateAbbreviations: Record<string, string> = Object.fromEntries(
  Object.entries(stateNames).map(([abbr, name]) => [name.toLowerCase(), abbr])
);

// State slug to abbreviation (e.g., "north-dakota" -> "ND")
export const stateSlugToAbbr: Record<string, string> = Object.fromEntries(
  Object.entries(stateNames).map(([abbr, name]) => [name.toLowerCase().replace(/\s+/g, '-'), abbr])
);
