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

export const agents: Agent[] = [];

export const properties: Property[] = [];

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
