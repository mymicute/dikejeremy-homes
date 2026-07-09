import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { PropertyCard } from "@/components/site/PropertyCard";
import { properties } from "@/lib/mock-data";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Saved properties — Dejedy" },
      { name: "description", content: "Your saved properties and price-drop alerts." },
    ],
  }),
  component: Favorites,
});

function Favorites() {
  const saved = properties.slice(0, 3);
  return (
    <div className="min-h-screen bg-navy-50 pb-32">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
        <h1 className="mb-2 font-display text-3xl font-semibold text-navy-950">Saved</h1>
        <p className="mb-8 inline-flex items-center gap-1.5 text-sm text-navy-700">
          <Heart className="size-4 fill-red-500 text-red-500" /> {saved.length} saved properties
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
