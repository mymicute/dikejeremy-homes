import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { PropertyMap } from "@/components/site/PropertyMap";
import { MapPin, ArrowLeft, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/mock-data";
import type { Tables } from "@/integrations/supabase/types";

type Property = Tables<"properties">;

export const Route = createFileRoute("/map")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Property map — Dejedy" },
      { name: "description", content: "Discover tagged properties on the map across Nigeria." },
    ],
  }),
  component: MapView,
});

function MapView() {
  const [items, setItems] = useState<Property[]>([]);

  useEffect(() => {
    supabase
      .from("properties")
      .select("*")
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .then(({ data }) => setItems(data ?? []));
  }, []);

  const pins = items.map((p) => ({
    id: p.id,
    lat: p.latitude as number,
    lng: p.longitude as number,
    title: p.title,
    price: formatNaira(Number(p.price), p.listing_type),
  }));

  return (
    <div className="min-h-screen bg-navy-50 pb-32">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
        <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy-700 hover:text-navy-950">
          <ArrowLeft className="size-4" /> Back
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="relative">
            {pins.length > 0 ? (
              <PropertyMap pins={pins} height={640} />
            ) : (
              <div className="grid h-[420px] place-items-center rounded-3xl bg-white ring-1 ring-black/5 lg:h-[640px]">
                <div className="text-center">
                  <MapPin className="mx-auto size-8 text-navy-700" />
                  <p className="mt-3 font-display text-lg text-navy-950">No tagged properties yet</p>
                  <Link to="/list-property" className="mt-4 inline-block rounded-full bg-navy-950 px-5 py-2 text-sm text-white">List one</Link>
                </div>
              </div>
            )}
            {pins.length > 0 && (
              <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-black/5">
                <MapPin className="size-3 text-navy-950" />
                <span className="text-xs font-semibold">{pins.length} properties on the map</span>
              </div>
            )}
          </div>

          <div className="space-y-3 lg:max-h-[640px] lg:overflow-y-auto">
            {items.map((p) => (
              <Link key={p.id} to="/property/$id" params={{ id: p.id }} className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-black/5 hover:ring-navy-700/40">
                <div className="size-24 shrink-0 overflow-hidden rounded-xl bg-navy-50">
                  {p.image_url ? (
                    <img src={p.image_url} loading="lazy" alt={p.title} className="size-full object-cover" />
                  ) : (
                    <div className="grid size-full place-items-center"><Building2 className="size-6 text-navy-700" /></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-navy-700">{p.location ?? p.city}</p>
                  <p className="truncate font-display font-semibold text-navy-950">{formatNaira(Number(p.price), p.listing_type)}</p>
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
