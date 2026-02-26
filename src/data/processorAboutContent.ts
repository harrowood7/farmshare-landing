// Processor About Content - Real descriptions sourced from websites, Facebook, press coverage
// Usage: Import and merge into ProcessorDetail.tsx to replace generic placeholder content
// UPDATED: All 25 processors now have real, researched content (v2)

export const processorAboutContent: Record<string, {
  about: string;
  established?: string;
  owners?: string;
  certifications?: string[];
  highlights?: string[];
  website?: string;
  source?: string;
}> = {

  "d-d-meats-celina-tn": {
    about: "D&D Meats is a third-generation, family-owned USDA-inspected processing facility located in the Upper Cumberland region of Middle Tennessee. Founded by the Donaldson family, D&D Meats operates on a 300-acre farm in Celina, Tennessee, where they raise, process, and sell premium beef, pork, and lamb. The facility is vertically integrated — controlling the entire lifecycle from pasture to package. In partnership with Donaldson Farms, they produce and finish F1 Akaushi cross steers on a grain diet for a minimum of 180 days. In 2024, D&D Meats was certified as a River Friendly Farm by the Cumberland River Compact for their commitment to sustainable land and water stewardship.",
    established: "2012",
    owners: "The Donaldson Family (John Donaldson and sons)",
    certifications: ["USDA Inspected", "River Friendly Farm (Cumberland River Compact)"],
    highlights: [
      "Third-generation cattle family",
      "300-acre vertically integrated operation",
      "F1 Akaushi (Wagyu) cross beef program",
      "Certified in low-stress animal handling",
      "River Friendly Farm certified for sustainability"
    ],
    website: "https://danddmeats.net",
    source: "danddmeats.net, Cumberland River Compact, Pick TN Products"
  },

  "chipola-meats-graceville-fl": {
    about: "Chipola Meats Processing is a custom and USDA meat processing facility located in Jackson County, Florida. They specialize in processing beef, hog, goat, sheep, and alligator for local farmers and ranchers across the Florida panhandle. As one of the few full-service processors in the region, Chipola Meats serves as a critical link for agricultural producers looking for reliable, inspected processing close to home.",
    owners: "Chipola Meats Processing",
    certifications: ["USDA Inspected", "Custom Processing"],
    highlights: [
      "Custom and USDA processing services",
      "Processes beef, hog, goat, sheep, and alligator",
      "Serves Jackson County and surrounding Florida panhandle"
    ],
    website: "https://chipolameats.com",
    source: "chipolameats.com"
  },

  "homeplace-pastures-como-ms": {
    about: "Home Place Pastures is a fifth-generation, 1,800-acre regenerative farm in Como, Mississippi, founded by the Bartlett family in 1871. Under the leadership of Marshall Bartlett, the farm transitioned from conventional row crops to pasture-raised livestock, producing grass-fed beef, pasture-raised pork, and lamb — all processed on-site under federal inspection. Their meat is Certified Humane and produced without antibiotics, growth promotants, or synthetic chemicals. Home Place Pastures has become a cornerstone of Mississippi's local food economy, supplying top restaurants from Nashville to New Orleans while also feeding their local community through an on-site farm store, lunch counter, and monthly farm-to-table dinners.",
    established: "1871 (farm); modern operations under Marshall Bartlett",
    owners: "The Bartlett Family (Marshall Bartlett, 5th generation)",
    certifications: ["USDA Inspected", "Certified Humane", "Certified Grass-Fed"],
    highlights: [
      "Fifth-generation farm, founded 1871",
      "1,800-acre regenerative operation",
      "On-site USDA-inspected processing",
      "Certified Humane, no antibiotics or growth promotants",
      "Supplies top restaurants from Nashville to New Orleans",
      "Farm store, lunch counter, and farm-to-table dinners"
    ],
    website: "https://homeplacepastures.com",
    source: "homeplacepastures.com, Yelp, Genuine Mississippi, Country Roads Magazine"
  },

  "the-butchers-block-dry-fork-va": {
    about: "The Butcher's Block is a family-owned and operated USDA-licensed custom processing facility in Dry Fork, Virginia. Owned by Andy and Samantha Thomas, the shop is known for its excellent customer service and willingness to take on butchering projects of all sizes. They specialize in custom cut processing with vacuum sealing, and offer a wide variety of sausages and specialty products including jalapeño cheese sausage and meat sticks. The Butcher's Block has earned a reputation for quality work and fast turnaround, even accommodating out-of-state hunters with tight timelines.",
    established: "2007",
    owners: "Andy and Samantha Thomas",
    certifications: ["USDA Licensed"],
    highlights: [
      "Family owned and operated since 2007",
      "USDA licensed for custom cut processing",
      "Vacuum sealing and custom labeling",
      "Wide variety of sausages and specialty products",
      "BBB A+ rated"
    ],
    website: "http://www.butchersblockva.com",
    source: "butchersblockva.com, BBB, Chamber of Commerce reviews"
  },

  "heartquist-hollow-farm-winkelman-az": {
    about: "Heartquist Hollow Farm is a family-owned operation in Winkelman, Arizona, raising grass-fed beef, lamb, and heritage pork on pasture. The farm began in 2017 as a family homestead to teach their children where food comes from — a mission that took on deeper meaning after surviving a battle with bone cancer. In 2021, they merged with Double Check Ranch, a multigenerational ranch operation led by Paul Schwennesen, combining grass-fed beef with pasture-raised lamb and heritage pork. The farm operates its own USDA-inspected processing facility on-site, ensuring quality control from pasture to package. Their products are featured at restaurants including The Arizona Inn and Canyon Ranch.",
    established: "2017 (Heartquist Hollow); merged with Double Check Ranch 2021",
    owners: "Heartquist family and Paul Schwennesen (Double Check Ranch)",
    certifications: ["USDA Inspected"],
    highlights: [
      "Family homestead started after surviving bone cancer",
      "Merged with Double Check Ranch (est. 2007) in 2021",
      "On-site USDA-inspected processing",
      "Grass-fed beef, pasture-raised lamb, heritage pork",
      "Featured at Arizona Inn, Canyon Ranch, and area restaurants",
      "Active at Phoenix and Tucson farmers markets"
    ],
    website: "https://www.heartquisthollowfarm.com",
    source: "heartquisthollowfarm.com, Yelp, Locally Grown, Farmbox Arizona"
  },

  "rocky-mountain-meats-hesperus-co": {
    about: "Rocky Mountain Meats is a USDA-inspected meat processing facility located in Hesperus, Colorado, in La Plata County. Connected to the Foutz family's Cross Creek Ranch — a cattle operation with roots in southwestern Colorado dating back to the late 1800s — Rocky Mountain Meats was built to serve local ranchers who previously had to ship livestock hundreds of miles for processing. The facility has capacity to process up to 200 cattle per month and also handles wild game. Half of the processing slots beyond their own ranch needs are reserved for Montezuma County ranchers, making it a true community resource for the Four Corners region.",
    owners: "Chad Foutz / Cross Creek Ranch",
    certifications: ["USDA Inspected"],
    highlights: [
      "Connected to Cross Creek Ranch (Foutz family, est. late 1800s)",
      "Capacity for up to 200 cattle per month",
      "Also processes wild game",
      "Reserves processing slots for local Montezuma County ranchers",
      "Received USDA grant in 2023",
      "Serves Four Corners region of Colorado"
    ],
    website: "https://rockymountainmeatprocessing.com",
    source: "The Journal (Cortez), FSIS, Ag Service Finder, Cross Creek Ranch"
  },

  "sunnyside-meats-durango-co": {
    about: "Sunnyside Meats is Southwest Colorado's USDA-inspected, organically certified livestock processing facility, operating since 2002 in Durango. The family behind Sunnyside has deep roots in La Plata County — their ancestors came to the area as farmers and ranchers in the late 1890s, and two of their homestead ranches are recognized as Colorado Centennial Farms, having been in the family for over 100 years. Sunnyside Meats processes beef, pork, goat, and lamb, serving the local ranching community while supplying premium meats to their sister business, Sunnyside Farms Market, and restaurants throughout Durango.",
    established: "2002",
    owners: "Holly Zink / Sunnyside Farms",
    certifications: ["USDA Inspected", "Organic Certified (since 2004)"],
    highlights: [
      "Operating since 2002 in Durango",
      "Organically certified since 2004",
      "Family roots in La Plata County since 1890s",
      "Two Colorado Centennial Farm designations",
      "Processes beef, pork, goat, and lamb",
      "Supports 4-H, FFA, and agricultural education"
    ],
    website: "https://sunnysidemeats.com",
    source: "sunnysidemeats.com, sunnysidefarmsmarket.com"
  },

  "adams-farm-slaughterhouse-llc-athol-ma": {
    about: "Adams Farm Slaughterhouse is a third-generation, family-owned meat processor in Athol, Massachusetts — the largest slaughterhouse in New England. The farm was purchased by Hester Adams in 1919, and her son Lewis opened the first slaughterhouse on the property in 1946. Today it's owned and operated by Beverly Mundell, her son Richard Adams, and her daughter Noreen Heath-Paniagua. After a devastating fire destroyed the facility in December 2006, the family rebuilt a state-of-the-art 13,800 square foot USDA-inspected, Halal-certified processing plant — designed with input from Dr. Temple Grandin for humane animal handling. More than 500 small farms across New England rely on Adams Farm for processing services.",
    established: "1946 (slaughterhouse); 1919 (farm)",
    owners: "Beverly Mundell, Richard Adams, Noreen Heath-Paniagua, Chelsea White",
    certifications: ["USDA Inspected", "Halal Certified"],
    highlights: [
      "Third-generation, largest slaughterhouse in New England",
      "Rebuilt after 2006 fire with Temple Grandin design input",
      "13,800 sq ft state-of-the-art facility",
      "Serves 500+ small farms across New England",
      "USDA-inspected and Halal-certified",
      "Received $90K Food Security Infrastructure Grant"
    ],
    website: "https://adamsfarm.biz",
    source: "adamsfarm.biz, Edible Boston, Farm Values, BBB, NCMDC"
  },

  "cuttinup-meat-processing-leeton-mo": {
    about: "Cuttin' Up Custom Meat Processing is a USDA-inspected red meat processing facility in Leeton, Missouri, owned by William Payne. What started as a deer and wild game processing operation at the start of the COVID-19 pandemic quickly grew into a full-service 8,000 square foot facility serving the local farming community. Cuttin' Up offers farm kills (mobile slaughter), in-house slaughter, and livestock pickup service. They guarantee your animal back with your choice of hang time. Their retail store is stocked with beef, pork, lamb, goat, chicken, fish, and seafood. They've since expanded with a second retail location, The Meat Market, in nearby Warrensburg.",
    established: "2020",
    owners: "William Payne",
    certifications: ["USDA Inspected"],
    highlights: [
      "Started during COVID-19 pandemic, grown rapidly",
      "8,000 sq ft USDA-inspected facility",
      "Farm kills, in-house slaughter, and pickup service",
      "Guarantees your animal back with custom hang time",
      "Award-winning bacon (Missouri State Fair)",
      "Second retail location in Warrensburg, MO"
    ],
    website: "https://cuttinupmeats.com",
    source: "cuttinupmeats.com, Columbia Missourian, Star-Journal"
  },

  "beef-bacon-calhoun-ky": {
    about: "Beef & Bacon Custom Processing is a family-owned meat processing facility in McLean County, Kentucky, operated by Rod and Clay Kuegel. The Kuegels are generational Daviess County row crop and tobacco farmers who transitioned to meat processing after 70 years of growing tobacco. They purchased the former Beef and Bacon building in late 2020 after a fire damaged it, rebuilt the facility, and opened for business in April 2021. Clay taught himself butchering by watching the 'Bearded Butchers' on YouTube. The shop was fully booked within six weeks of taking reservations.",
    established: "2021 (Kuegel family); original facility earlier",
    owners: "Rod Kuegel and Clay Kuegel",
    certifications: ["Custom Processing"],
    highlights: [
      "Family transitioned from 70 years of tobacco farming",
      "Rebuilt fire-damaged facility and reopened April 2021",
      "Self-taught butchering via YouTube's 'Bearded Butchers'",
      "Fully booked within 6 weeks of opening",
      "Custom whole and half cow/pig processing",
      "Expanding into retail, sheep, goat, and deer processing"
    ],
    source: "Messenger-Inquirer, Yahoo News"
  },

  "flint-packers-andersonville-ga": {
    about: "Flint Packers LLC is a start-up cattle and hog processing facility in Macon County, Georgia, owned by Austin Jones — a local cattleman and family man. In 2024, Flint Packers received $1.2 million through the USDA Meat and Poultry Processing Expansion Program to build a new 12,000 square foot USDA-certified processing facility. The plant was created to serve local farmers who previously had to transport livestock hundreds of miles for processing. At full capacity, the facility is projected to generate $5 million annually and create 23 jobs in the community.",
    owners: "Austin Jones",
    certifications: ["USDA Certified (in development)"],
    highlights: [
      "Received $1.2M USDA Meat and Poultry Processing Expansion grant",
      "12,000 sq ft new facility",
      "Serves local Georgia farmers lacking nearby processing",
      "Projected $5M annual revenue and 23 jobs at capacity",
      "Owned by local cattleman Austin Jones"
    ],
    source: "Congressman Bishop press release, USDA"
  },

  "westcliffe-meats-westcliffe-co": {
    about: "Westcliffe Meats is a small, family-owned USDA butcher shop nestled at the foot of the Sangre de Cristo Mountains in Colorado's Wet Mountain Valley. They offer USDA-inspected slaughtering and processing of beef, pork, lamb, goat, bison, yak, and poultry, as well as wild game processing during hunting season. All products are vacuum sealed and boxed, with custom labels available. The facility has developed a comprehensive safe and humane handling processing program, and they welcome visitors for tours of their operation.",
    owners: "Family owned (Westcliffe Meats LLC)",
    certifications: ["USDA Inspected"],
    highlights: [
      "Located at the foot of the Sangre de Cristo Mountains",
      "Processes beef, pork, lamb, goat, bison, yak, and poultry",
      "Wild game processing including big game",
      "Vacuum sealed products with custom labeling",
      "Humane animal handling program",
      "Retail store and tours available"
    ],
    website: "https://www.westcliffemeats.com",
    source: "westcliffemeats.com, Visit Custer County, Nextdoor"
  },

  "dayton-meat-products-malcom-ia": {
    about: "Dayton Meat Products is an award-winning, family-owned meat locker in Malcom, Iowa, established in 1959 by Lawrence Dayton. Originally called the Malcom Locker, the business has grown across three generations from two employees to a full-service operation with custom processing, a retail store, catering, and over 60 varieties of smoked and specialty meats. In 1999, Lawrence retired and sold the business to his sons Bill and David and son-in-law Mark Lang. Bill Dayton was inducted into the AAMP Cured Meats Hall of Fame in 2015. The company processes more than 700 beef, 700 hogs, and 45,000 pounds of deer meat each year, and has won over 400 championship honors.",
    established: "1959",
    owners: "Bill Dayton, David Dayton, Mark Lang (3rd generation Jake Dayton)",
    certifications: ["USDA Inspected"],
    highlights: [
      "Established 1959, three-generation family business",
      "400+ championship awards for cured meats",
      "Bill Dayton: AAMP Cured Meats Hall of Fame (2015)",
      "7 gold medals at German Butchers' Association IFFA Competition",
      "Processes 700+ beef, 700+ hogs, 45,000 lbs deer annually",
      "60+ varieties of smoked sausages"
    ],
    website: "https://www.daytonmeatproduct.com",
    source: "daytonmeatproduct.com, National Provisioner, Southeast Iowa Union, IMPA"
  },

  "royal-butcher-braintree-vt": {
    about: "The Royal Butcher is a USDA-inspected slaughterhouse and meat processor established in 2003 by Royal Larocque in Braintree, Vermont. The facility serves approximately 300 farms across Vermont and New Hampshire, from small operations bringing one animal per year to larger farms dropping off half a dozen per week. In 2011, The Royal Butcher expanded to include small animal processing (sheep, goats, and hogs) with financing from the Vermont Agricultural Credit Corporation. During the COVID-19 pandemic, they received additional grant funding to expand capacity and better serve farmers facing disrupted supply chains.",
    established: "2003",
    owners: "Royal Larocque, Justin Sauerwein",
    certifications: ["USDA Inspected"],
    highlights: [
      "Serves approximately 300 farms in VT and NH",
      "Expanded in 2011 for small animal processing",
      "USDA-inspected slaughter and processing",
      "Received COVID-19 business development grant for expansion",
      "Critical node in New England's local food economy"
    ],
    website: "http://www.royalbutcher.com",
    source: "VEDA, Vermont Agency of Agriculture, Seven Days VT"
  },

  "potts-meats-wartrace-tn": {
    about: "Potts' Meats is a sixth-generation family farm and USDA meat processing facility located in Wartrace, Tennessee. Currently owned and operated by Chad Grubbs and his wife Pepper, with their son Heath representing the next generation, the family has over 125 years of combined experience in farming and butchering. The processing operation dates back to 1972, with the family farming the same land for six generations. Chad earned the facility's USDA Grant of Inspection in 2019 after two years of preparation, including Food Safety courses at Penn State. Potts' Meats processes beef, pork, lamb, and goat, and has formed a cooperative with select local growers.",
    established: "1972 (processing); farm is six generations",
    owners: "Chad Grubbs and Pepper Grubbs (4th generation processors)",
    certifications: ["USDA Inspected (Grant of Inspection 2019)"],
    highlights: [
      "Sixth-generation family farm",
      "USDA licensed since 2019",
      "125+ years combined experience in farming and butchering",
      "Cooperative with select local Tennessee growers",
      "Grass-finished and grain-finished options",
      "On-site retail store with meats, cakes, jams, and seasonings"
    ],
    website: "https://pottsmeats.com",
    source: "pottsmeats.com, Shelbyville Times-Gazette, Yelp"
  },

  "mountain-view-custom-meats-coeur-dalene-id": {
    about: "Mountain View Custom Meats was founded in 2007 by Kevin and Heather Trosclair with the vision of offering custom meat services in a professional environment. Located in Coeur d'Alene, Idaho, the facility has continually updated its equipment and processes, growing each year while maintaining a boutique feel. Kevin began his meat industry career in 1980 as an apprentice, then joined the US Air Force in 1982 where he completed the military's meat school and managed the largest meat market in the military. After leaving the military in 1992 and pursuing a career in electronics purchasing, his passion for meat processing and sausage making drew him back. Kevin now serves as Vice President of the Northwest Meat Processors Association (NWMPA), where he plays a pivotal role in advancing the industry and supporting the NWMPA's apprenticeship program.",
    established: "2007",
    owners: "Kevin and Heather Trosclair",
    certifications: ["Custom Processing"],
    highlights: [
      "Founded 2007 with a 'meat boutique' philosophy",
      "Kevin Trosclair: US Air Force meat school graduate",
      "Managed largest meat market in the military",
      "Vice President of Northwest Meat Processors Association",
      "Champion of NWMPA apprenticeship program",
      "Multiple NWMPA competition awards including Sharpest Knife"
    ],
    website: "https://www.mountainviewcustommeats.com",
    source: "mountainviewcustommeats.com/our-story"
  },

  "pelkins-smokey-meat-market-crivitz-wi": {
    about: "Pelkin's Smokey Meat Market is a third-generation, family-owned butcher and custom meat processor established in 1973 in Crivitz, Wisconsin. With over 50 years of experience, Pelkin's has grown from a single location into a full-service operation with two shops — their original Crivitz location in the heart of Wisconsin's Northwoods and a second in Suamico. The facility is federally inspected and HACCP certified, offering custom processing from beef, pork, lamb, and goat to their renowned wild game processing. They feature an industry-leading venison hanging cooler with capacity for 325 animals and handcraft over 70 flavors of bratwurst and 30+ flavors of snack sticks using USDA Choice cuts.",
    established: "1973",
    owners: "Pelkin Family (third generation)",
    certifications: ["USDA Inspected", "HACCP Certified"],
    highlights: [
      "Family-owned since 1973, now third generation",
      "Two locations: Crivitz and Suamico, WI",
      "325-animal capacity venison hanging cooler",
      "70+ bratwurst flavors, 30+ snack stick flavors",
      "HACCP certified, federally inspected",
      "Open 7 days a week",
      "Full North Woods Country store with cheeses and spices"
    ],
    website: "https://pelkinsmeat.com",
    source: "pelkinsmeat.com, pelkinsmeatmarket.com, Manta, Yelp"
  },

  "6-in-1-meats-new-salem-nd": {
    about: "6 in 1 Meats is a meat processing facility in Turtle Lake, North Dakota, purchased in October 2020 by six livestock producers from across the state. Formerly known as Prairie West Meats — where owners Kim Bauer and Steve Doll had processed beef for over 15 years — the new ownership group changed the name to represent six owners coming together for one purpose: having a reliable source for processing their livestock and delivering a consistent, uniform product. One of their first objectives was obtaining the federal stamp for USDA-inspected processing. While historically beef-only, 6 in 1 Meats is expanding to process all species including beef, sheep, pigs, and elk.",
    established: "2020 (as 6 in 1 Meats); facility operated previously as Prairie West Meats",
    owners: "Six North Dakota livestock producers (ownership group)",
    certifications: ["USDA Inspected (obtained post-acquisition)"],
    highlights: [
      "Six rancher-owners united for one purpose",
      "Formerly Prairie West Meats (15+ years of operations)",
      "Expanding from beef-only to all species",
      "Obtained federal inspection stamp",
      "Serves ranchers across North Dakota"
    ],
    website: "https://6in1meats.com",
    source: "6in1meats.com"
  },

  "rawhide-meats-white-sulphur-springs-mt": {
    about: "Rawhide Meats is a family-run USDA-inspected meat processing facility in White Sulphur Springs, Montana, in the heart of Meagher County. Owned by Scott and Cory Von Seggern, who left Corporate America to put down roots in Montana, the shop was purchased to ensure local ranchers would continue to have a place to process their livestock. Their son AJ Von Seggern has joined the operation, making it a true family business. Rawhide Meats serves over 75 local ranches, offering processing of beef, lamb, pork, and buffalo. The retail space features house-made sausage, meat sticks, and select cuts, and they also offer wild game processing in the fall.",
    owners: "Scott and Cory Von Seggern (son AJ Von Seggern)",
    certifications: ["USDA Inspected"],
    highlights: [
      "Corporate America transplants turned Montana butchers",
      "Family-run: Scott, Cory, and son AJ Von Seggern",
      "Serves 75+ local ranches in Meagher County",
      "Processes beef, lamb, pork, and buffalo",
      "In-house harvesting capability",
      "Retail counter with house-made sausages and meat sticks",
      "Wild game processing in fall season"
    ],
    website: "https://www.rawhidemeats.net",
    source: "rawhidemeats.net/about-us"
  },

  "folletts-meat-co-hermiston-or": {
    about: "Follett's Meat Company is a family-owned and operated meat processor in Hermiston, Oregon, continuously serving the Columbia Basin and eastern Oregon since 1921. Now in its fourth generation under owner Justin Follett, the company provides custom meat processing for beef, pork, lamb, and wild game with both stationary and mobile slaughter capabilities. Follett's is a regular award winner at the Northwest Meat Processors Association conventions, taking home grand champion honors for their pepper bacon, pepper jerky, and jalapeño cheese summer sausage. In 2024, they received a $697,500 grant from the Oregon Department of Agriculture to expand their processing capacity.",
    established: "1921",
    owners: "Justin Follett (4th generation)",
    certifications: ["Custom Processing", "State Inspected"],
    highlights: [
      "Family-owned since 1921, fourth generation",
      "NWMPA Grand Champion: pepper bacon, pepper jerky",
      "Champion: jalapeño cheese summer sausage",
      "Stationary and mobile slaughter capabilities",
      "Received $697,500 Oregon state grant (2024)",
      "Processes beef, pork, lamb, and wild game"
    ],
    website: "https://www.follettsmeat.com",
    source: "Hermiston Herald, East Oregonian, Oregon Dept of Agriculture, MEAT+POULTRY"
  },

  "weimer-meats-custom-new-alexandria-pa": {
    about: "Weimer Meats is a family-owned meat processing operation located on Weimer Road in New Alexandria, Pennsylvania — a name synonymous with butchering in Westmoreland County. Owned by Wade Weimer, the operation offers custom cut processing including halves, quarters, and individual cuts with grinding and vacuum wrapping services. The USDA-inspected facility at 1034 Industrial Boulevard in Bradenville received its federal grant of inspection in August 2021, enabling both custom and commercial processing. With 10-20 employees and participation in Pennsylvania's Hunters Sharing the Harvest program, Weimer Meats is a key part of western Pennsylvania's local food infrastructure.",
    established: "2021 (USDA grant of inspection)",
    owners: "Wade Weimer",
    certifications: ["USDA Inspected"],
    highlights: [
      "Family name on the road — deep local roots",
      "USDA-inspected since August 2021",
      "Custom and commercial processing",
      "10-20 employees",
      "Participates in Hunters Sharing the Harvest program",
      "Serves western Pennsylvania farming community"
    ],
    source: "FSIS, Cortera, Hunters Sharing the Harvest, PA Farms Direct"
  },

  "weimer-meats-usda-new-alexandria-pa": {
    about: "Weimer Meats USDA is the federally inspected arm of the Weimer family's meat processing operation in New Alexandria, Pennsylvania. Located at 1034 Industrial Boulevard in Bradenville, this facility received its USDA grant of inspection in August 2021, enabling local farmers to process livestock for commercial resale to retail customers and restaurants. This complements the family's custom processing operation on Weimer Road, giving producers in western Pennsylvania a one-stop solution for both personal and commercial meat processing.",
    established: "2021 (USDA grant of inspection)",
    owners: "Wade Weimer",
    certifications: ["USDA Inspected"],
    highlights: [
      "USDA-inspected processing for commercial resale",
      "Companion facility to Weimer Custom Meats",
      "Located at 1034 Industrial Blvd, Bradenville, PA",
      "Serves western Pennsylvania farmers and producers"
    ],
    source: "FSIS, Cortera"
  },

  "simla-foods-simla-co": {
    about: "Simla Frozen Foods is a family-operated business established in 1990, when a family of five moved to Simla, Colorado from the Netherlands. Located on Colorado's eastern plains about 70 miles southeast of Denver, they specialize in custom cutting, butchering, and curing/smoking of beef, hogs, and lambs — and also raise and process their own chickens for retail sale. The operation includes a retail grocery store offering imported cheeses, frozen foods, pantry items, and household goods. In 2024, Simla Frozen Food Locker received a $450,000 USDA grant to build a new facility across the street from their existing location to expand processing capacity.",
    established: "1990",
    owners: "Dutch immigrant family",
    certifications: ["Custom Processing"],
    highlights: [
      "Founded 1990 by family from the Netherlands",
      "Custom butchering, cutting, curing, and smoking",
      "Raises and processes their own chickens",
      "Retail grocery with imported Dutch cheeses",
      "Received $450,000 USDA expansion grant (2024)",
      "Processes beef, hogs, lambs, chicken, turkey, goat"
    ],
    website: "https://simlafoods.com",
    source: "simlafoods.com, High Plains Journal, ZoomInfo"
  },

  "butcher-bros-rushville-in": {
    about: "Butcher Bros is a custom meat processing operation at 4733 E Gings Road in Rushville, Indiana, serving the farming community of Rush County and central Indiana. Under recent new ownership, the business provides custom butchering and processing services for local livestock producers. Known for friendly staff and quality processing done to customer specifications, Butcher Bros handles beef and pork processing for families looking to fill their freezers with locally raised meat.",
    owners: "New ownership (recently renamed from prior operation)",
    highlights: [
      "Located in Rushville, Indiana",
      "Recently renamed under new ownership",
      "Custom processing for central Indiana farmers",
      "Beef and hog processing to customer specifications",
      "Serves Rush County agricultural community"
    ],
    source: "Google Reviews, Menuweb"
  },

  "beaverhead-meats-dillon-mt": {
    about: "Beaverhead Meats is a third-generation family meat shop in Dillon, Montana, owned by the McGinley family. The roots trace back to 1969 when Daniel 'Pappy' McGinley moved to Dillon and started Pappy's Meat Market on Montana Street. His son Mike took over as a young adult and eventually moved the operation to its current location at 620 N Montana Street, renaming it Beaverhead Meats. Today, Mike's son David McGinley manages daily operations — a craft he learned spending time with his grandfather Pappy as a child. The shop serves Beaverhead County, one of Montana's premier cattle-producing regions, and David is actively planning expansion to meet growing demand from local ranchers and hunters.",
    established: "1969 (as Pappy's Meat Market)",
    owners: "McGinley Family — Mike McGinley (owner), David McGinley (manager, 3rd generation)",
    certifications: ["Custom Processing"],
    highlights: [
      "Three-generation McGinley family operation since 1969",
      "Started as Pappy's Meat Market by Daniel McGinley",
      "Located in Beaverhead County, premier cattle region",
      "David McGinley: learned butchering from his grandfather",
      "Active expansion planning for increased capacity",
      "Member of Montana Meat Processors Association"
    ],
    website: "https://www.beaverheadmeats.com",
    source: "Dillon Tribune, NBC Montana, MT Meat Processors Association"
  }
};
