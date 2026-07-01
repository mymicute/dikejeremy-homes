import carSuv from "@/assets/car-toyota-suv.jpg";
import carSedan from "@/assets/car-mercedes.jpg";
import carHatch from "@/assets/car-honda.jpg";
import svcPaint from "@/assets/service-painting.jpg";
import svcClean from "@/assets/service-cleaning.jpg";
import svcPlumb from "@/assets/service-plumbing.jpg";
import svcElec from "@/assets/service-electrical.jpg";
import svcCarp from "@/assets/service-carpentry.jpg";
import { formatNaira } from "@/lib/mock-data";

export type Car = {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  price: number;
  listingType: "Buy" | "Rent";
  condition: "Brand New" | "Foreign Used" | "Nigerian Used";
  transmission: "Automatic" | "Manual";
  fuel: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  mileageKm: number;
  city: string;
  state: string;
  image: string;
  verified: boolean;
  vendorId: string;
};

export type Service = {
  id: string;
  title: string;
  category: "Painting" | "Cleaning" | "Plumbing" | "Electrical" | "Carpentry" | "AC Repair" | "Moving" | "Fumigation";
  priceFrom: number;
  unit: string; // "/ visit", "/ room", "/ day"
  city: string;
  rating: number;
  reviews: number;
  responseTimeMins: number;
  image: string;
  verified: boolean;
  vendorId: string;
  description: string;
};

export const cars: Car[] = [
  { id: "c1", title: "Toyota Fortuner 2022", make: "Toyota", model: "Fortuner", year: 2022, price: 42_000_000, listingType: "Buy", condition: "Foreign Used", transmission: "Automatic", fuel: "Petrol", mileageKm: 28_000, city: "Lagos", state: "Lagos", image: carSuv, verified: true, vendorId: "a1" },
  { id: "c2", title: "Mercedes-Benz C300 2019", make: "Mercedes-Benz", model: "C300", year: 2019, price: 28_500_000, listingType: "Buy", condition: "Foreign Used", transmission: "Automatic", fuel: "Petrol", mileageKm: 62_000, city: "Abuja", state: "FCT", image: carSedan, verified: true, vendorId: "a2" },
  { id: "c3", title: "Honda Fit 2018 — Clean", make: "Honda", model: "Fit", year: 2018, price: 9_800_000, listingType: "Buy", condition: "Nigerian Used", transmission: "Automatic", fuel: "Petrol", mileageKm: 98_000, city: "Lagos", state: "Lagos", image: carHatch, verified: true, vendorId: "a5" },
  { id: "c4", title: "Toyota Fortuner — Daily Rental", make: "Toyota", model: "Fortuner", year: 2023, price: 85_000, listingType: "Rent", condition: "Brand New", transmission: "Automatic", fuel: "Petrol", mileageKm: 12_000, city: "Lagos", state: "Lagos", image: carSuv, verified: true, vendorId: "a1" },
];

export const services: Service[] = [
  { id: "s1", title: "Interior painting — 1 to 5 rooms", category: "Painting", priceFrom: 45_000, unit: "/ room", city: "Lagos", rating: 4.9, reviews: 214, responseTimeMins: 15, image: svcPaint, verified: true, vendorId: "a1", description: "Two-coat interior painting with premium emulsion. Prep, taping, and clean-up included." },
  { id: "s2", title: "Deep home cleaning", category: "Cleaning", priceFrom: 25_000, unit: "/ visit", city: "Lagos", rating: 4.8, reviews: 512, responseTimeMins: 20, image: svcClean, verified: true, vendorId: "a5", description: "Full apartment deep clean — kitchen, bathrooms, floors, dusting and disinfecting." },
  { id: "s3", title: "Emergency plumbing repair", category: "Plumbing", priceFrom: 15_000, unit: "/ visit", city: "Abuja", rating: 4.7, reviews: 187, responseTimeMins: 30, image: svcPlumb, verified: true, vendorId: "a2", description: "Leak fixes, taps, water heaters, WC repair. Same-day dispatch." },
  { id: "s4", title: "Electrical installation & repair", category: "Electrical", priceFrom: 20_000, unit: "/ visit", city: "Lagos", rating: 4.8, reviews: 143, responseTimeMins: 25, image: svcElec, verified: true, vendorId: "a1", description: "Wiring, sockets, ceiling fans, inverter setup. Licensed electricians." },
  { id: "s5", title: "Fitted wardrobes & carpentry", category: "Carpentry", priceFrom: 180_000, unit: "/ project", city: "Lagos", rating: 4.9, reviews: 76, responseTimeMins: 60, image: svcCarp, verified: true, vendorId: "a5", description: "Custom wardrobes, TV units, kitchen cabinets. Free design consultation." },
  { id: "s6", title: "Post-construction cleaning", category: "Cleaning", priceFrom: 80_000, unit: "/ project", city: "Port Harcourt", rating: 4.7, reviews: 41, responseTimeMins: 45, image: svcClean, verified: true, vendorId: "a3", description: "Full site clean after renovation — dust, paint residue, window polish." },
  { id: "s7", title: "AC installation & servicing", category: "AC Repair", priceFrom: 12_000, unit: "/ unit", city: "Abuja", rating: 4.6, reviews: 98, responseTimeMins: 30, image: svcElec, verified: false, vendorId: "a4", description: "Split & window units — gas, servicing, mounting. Warranty on labour." },
  { id: "s8", title: "Home fumigation & pest control", category: "Fumigation", priceFrom: 35_000, unit: "/ visit", city: "Lagos", rating: 4.8, reviews: 132, responseTimeMins: 40, image: svcClean, verified: true, vendorId: "a1", description: "Safe residential fumigation — roaches, rats, termites. NAFDAC compliant." },
];

export const carCategories = ["All", "Buy", "Rent", "Brand New", "Foreign Used", "Nigerian Used"] as const;
export const serviceCategories = ["All", "Painting", "Cleaning", "Plumbing", "Electrical", "Carpentry", "AC Repair", "Fumigation"] as const;

export const getCar = (id: string) => cars.find(c => c.id === id);
export const getService = (id: string) => services.find(s => s.id === id);
export { formatNaira };
