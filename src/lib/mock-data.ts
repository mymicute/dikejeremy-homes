import villa from "@/assets/property-lekki-villa.jpg";
import apt from "@/assets/property-abuja-apt.jpg";
import terrace from "@/assets/property-ph-terrace.jpg";
import duplex from "@/assets/property-ikoyi-duplex.jpg";
import shortlet from "@/assets/property-shortlet.jpg";

export type Property = {
  id: string;
  title: string;
  price: number;
  listingType: "Buy" | "Rent" | "Short Let";
  type: string;
  city: string;
  area: string;
  state: string;
  beds: number;
  baths: number;
  toilets: number;
  sizeSqm: number;
  verified: boolean;
  images: string[];
  description: string;
  amenities: string[];
  agentId: string;
  lat: number;
  lng: number;
};

export type Agent = {
  id: string;
  name: string;
  company?: string;
  role: "Agent" | "Landlord" | "Developer" | "Company";
  avatarInitials: string;
  verified: boolean;
  phone: string;
  whatsapp: string;
  city: string;
  bio: string;
  rating: number;
  reviews: number;
  followers: number;
  listings: number;
  hasStatus: boolean;
};

export const agents: Agent[] = [
  { id: "a1", name: "Victoria Adeyemi", company: "Adeyemi Realty", role: "Agent", avatarInitials: "VA", verified: true, phone: "+234 803 111 2211", whatsapp: "+234 803 111 2211", city: "Lagos", bio: "10+ years in Lekki & Ikoyi luxury market. Verified concierge.", rating: 4.9, reviews: 187, followers: 2340, listings: 24, hasStatus: true },
  { id: "a2", name: "Abiodun Okafor", company: "Okafor Developments", role: "Developer", avatarInitials: "AO", verified: true, phone: "+234 802 445 9910", whatsapp: "+234 802 445 9910", city: "Abuja", bio: "Off-plan and luxury developments across Maitama and Guzape.", rating: 4.8, reviews: 96, followers: 1580, listings: 12, hasStatus: true },
  { id: "a3", name: "Chioma Nwosu", role: "Agent", avatarInitials: "CN", verified: true, phone: "+234 806 990 2231", whatsapp: "+234 806 990 2231", city: "Port Harcourt", bio: "Port Harcourt specialist. GRA, Peter Odili and Rumuola.", rating: 4.7, reviews: 61, followers: 890, listings: 9, hasStatus: true },
  { id: "a4", name: "Ibrahim Musa", role: "Landlord", avatarInitials: "IM", verified: false, phone: "+234 809 220 4411", whatsapp: "+234 809 220 4411", city: "Abuja", bio: "Direct landlord — Wuse and Jabi apartments.", rating: 4.4, reviews: 22, followers: 210, listings: 4, hasStatus: false },
  { id: "a5", name: "Sade Balogun", company: "Balogun & Sons", role: "Company", avatarInitials: "SB", verified: true, phone: "+234 805 118 7700", whatsapp: "+234 805 118 7700", city: "Lagos", bio: "Family-run brokerage since 1998. Ikeja GRA & Magodo.", rating: 4.8, reviews: 143, followers: 1200, listings: 18, hasStatus: false },
];

export const properties: Property[] = [
  {
    id: "p1", title: "6 Bedroom Fully Detached Mansion", price: 450_000_000, listingType: "Buy", type: "Duplex",
    city: "Lagos", area: "Lekki Phase 1", state: "Lagos",
    beds: 6, baths: 7, toilets: 8, sizeSqm: 620, verified: true,
    images: [villa, duplex, apt], agentId: "a1",
    description: "A signature waterfront mansion in the heart of Lekki Phase 1. Open-plan living, chef's kitchen, cinema room, private pool and staff quarters. Fully fitted, ready to move in.",
    amenities: ["Swimming Pool", "Gym", "24/7 Security", "Borehole", "Solar Backup", "CCTV", "Parking for 6"],
    lat: 6.4381, lng: 3.4728,
  },
  {
    id: "p2", title: "3 Bedroom Modern Apartment", price: 120_000_000, listingType: "Buy", type: "Apartment",
    city: "Abuja", area: "Guzape", state: "FCT",
    beds: 3, baths: 3, toilets: 4, sizeSqm: 180, verified: true,
    images: [apt, duplex], agentId: "a2",
    description: "Serviced luxury apartment with skyline views over Abuja. Concierge, gym and infinity pool on the rooftop.",
    amenities: ["Rooftop Pool", "Gym", "Concierge", "Elevator", "Parking"],
    lat: 9.0407, lng: 7.4915,
  },
  {
    id: "p3", title: "4 Bedroom Semi-Detached Terrace", price: 85_000_000, listingType: "Buy", type: "Terrace",
    city: "Port Harcourt", area: "Peter Odili Road", state: "Rivers",
    beds: 4, baths: 4, toilets: 5, sizeSqm: 260, verified: true,
    images: [terrace, duplex], agentId: "a3",
    description: "Contemporary terrace in a gated estate. All-en-suite, fitted kitchen and BQ.",
    amenities: ["Estate Security", "Borehole", "Parking", "Pet Friendly"],
    lat: 4.8156, lng: 7.0498,
  },
  {
    id: "p4", title: "5 Bedroom Contemporary Duplex", price: 320_000_000, listingType: "Buy", type: "Duplex",
    city: "Lagos", area: "Ikoyi", state: "Lagos",
    beds: 5, baths: 6, toilets: 7, sizeSqm: 510, verified: true,
    images: [duplex, villa], agentId: "a5",
    description: "Elegant duplex on quiet Ikoyi street with private courtyard.",
    amenities: ["Swimming Pool", "Study", "Gym", "Solar Backup", "CCTV"],
    lat: 6.4478, lng: 3.4356,
  },
  {
    id: "p5", title: "2 Bedroom Short-Let Apartment", price: 180_000, listingType: "Short Let", type: "Apartment",
    city: "Lagos", area: "Victoria Island", state: "Lagos",
    beds: 2, baths: 2, toilets: 2, sizeSqm: 110, verified: true,
    images: [shortlet, apt], agentId: "a1",
    description: "Nightly rate. Stylish VI apartment for short stays, business travel and getaways.",
    amenities: ["Wi-Fi", "Netflix", "Aircon", "24/7 Power", "Cleaning"],
    lat: 6.4281, lng: 3.4219,
  },
  {
    id: "p6", title: "3 Bedroom Apartment for Rent", price: 4_500_000, listingType: "Rent", type: "Apartment",
    city: "Abuja", area: "Maitama", state: "FCT",
    beds: 3, baths: 3, toilets: 4, sizeSqm: 165, verified: true,
    images: [apt, shortlet], agentId: "a2",
    description: "Annual rent. Spacious Maitama apartment in serviced compound.",
    amenities: ["Pool", "Gym", "Serviced", "24/7 Power", "CCTV"],
    lat: 9.0885, lng: 7.4933,
  },
  {
    id: "p7", title: "Self Contain Studio", price: 850_000, listingType: "Rent", type: "Studio",
    city: "Lagos", area: "Yaba", state: "Lagos",
    beds: 1, baths: 1, toilets: 1, sizeSqm: 32, verified: false,
    images: [shortlet], agentId: "a4",
    description: "Compact studio in Yaba tech corridor. Ideal for young professionals.",
    amenities: ["Wi-Fi Ready", "Prepaid Meter"],
    lat: 6.5095, lng: 3.3711,
  },
  {
    id: "p8", title: "1200 sqm Land — C of O", price: 95_000_000, listingType: "Buy", type: "Land",
    city: "Lagos", area: "Ajah", state: "Lagos",
    beds: 0, baths: 0, toilets: 0, sizeSqm: 1200, verified: true,
    images: [terrace], agentId: "a5",
    description: "Prime plot with Certificate of Occupancy. Suitable for residential or mixed use.",
    amenities: ["C of O", "Dry Land", "Corner Piece"],
    lat: 6.4698, lng: 3.5852,
  },
];

export const categories = [
  "Apartment", "Duplex", "Bungalow", "Self Contain", "Studio", "Short Let",
  "Office Space", "Shop", "Warehouse", "Land", "Commercial", "Luxury",
];

export const trendingLocations = [
  { name: "Maitama, Abuja", delta: "+12%" },
  { name: "Old GRA, Port Harcourt", delta: "+8%" },
  { name: "Ikoyi, Lagos", delta: "+15%" },
  { name: "Lekki Phase 1, Lagos", delta: "+9%" },
];

export function formatNaira(n: number, listingType?: string): string {
  const suffix =
    listingType === "Rent" ? " / year" :
    listingType === "Short Let" ? " / night" : "";
  return `₦${n.toLocaleString("en-NG")}${suffix}`;
}

export const getAgent = (id: string) => agents.find(a => a.id === id);
export const getProperty = (id: string) => properties.find(p => p.id === id);
