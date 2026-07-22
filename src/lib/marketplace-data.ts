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

export const cars: Car[] = [];

export const services: Service[] = [];


export const carCategories = ["All", "Buy", "Rent", "Brand New", "Foreign Used", "Nigerian Used"] as const;
export const serviceCategories = ["All", "Painting", "Cleaning", "Plumbing", "Electrical", "Carpentry", "AC Repair", "Fumigation"] as const;
export const electronicsCategories = ["All", "Phones", "Laptops", "TVs", "Audio", "Gaming", "Appliances", "Accessories"] as const;

export const getCar = (id: string) => cars.find(c => c.id === id);
export const getService = (id: string) => services.find(s => s.id === id);
export { formatNaira };
