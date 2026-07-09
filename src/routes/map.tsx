import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { MapPin, ArrowLeft } from "lucide-react";
import { properties, formatNaira } from "@/lib/mock-data";
import mapImage from "@/assets/map-lagos.jpg";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Property map — Dejedy" },
      { name: "description", content: "Discover properties on the map across Lagos, Abuja and Port Harcourt." },
    ],
  }),
  component: MapView,
});

function MapView() {
  return (
    <div className="min-h-screen bg-navy-50 pb-32">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
        <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy-700 hover:text-navy-950">
          <ArrowLeft className="size-4" /> Back
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-black/5">
            <img src={mapImage} alt="Map" className="h-[420px] w-full object-cover lg:h-[640px]" />
            <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-black/5">
              <MapPin className="size-3 text-navy-950" />
              <span className="text-xs font-semibold">{properties.length} properties on the map</span>
            </div>
          </div>

          <div className="space-y-3 lg:max-h-[640px] lg:overflow-y-auto">
            {properties.map((p) => (
              <Link
                key={p.id}
                to="/property/$id"
                params={{ id: p.id }}
                className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-black/5 hover:ring-navy-700/40"
              >
                <img src={p.images[0]} loading="lazy" alt={p.title} className="size-24 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-navy-700">{p.area}, {p.city}</p>
                  <p className="truncate font-display font-semibold text-navy-950">{formatNaira(p.price, p.listingType)}</p>
                  <p className="line-clamp-1 text-xs text-navy-700">{p.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
