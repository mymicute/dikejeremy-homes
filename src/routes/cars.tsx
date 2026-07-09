import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BadgeCheck, Fuel, Gauge, MapPin, Search } from "lucide-react";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { cars, carCategories, formatNaira } from "@/lib/marketplace-data";

type CarSearch = { q?: string; filter?: string };

export const Route = createFileRoute("/cars")({
  validateSearch: (s: Record<string, unknown>): CarSearch => ({
    q: typeof s.q === "string" ? s.q : undefined,
    filter: typeof s.filter === "string" ? s.filter : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Cars for sale & hire in Nigeria — Dejedy" },
      { name: "description", content: "Buy and rent verified cars in Lagos, Abuja and Port Harcourt. Brand new, foreign used and Nigerian used." },
      { property: "og:title", content: "Cars — Dejedy" },
      { property: "og:description", content: "Buy and rent verified cars across Nigeria." },
    ],
  }),
  component: CarsPage,
});

function CarsPage() {
  const search = Route.useSearch();
  const [q, setQ] = useState(search.q ?? "");
  const filter = search.filter ?? "All";

  const filtered = useMemo(() => {
    return cars.filter((c) => {
      if (filter !== "All") {
        if ((filter === "Buy" || filter === "Rent") && c.listingType !== filter) return false;
        if (["Brand New", "Foreign Used", "Nigerian Used"].includes(filter) && c.condition !== filter) return false;
      }
      if (q) {
        const hay = `${c.title} ${c.make} ${c.model} ${c.city}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [filter, q]);

  return (
    <div className="min-h-screen bg-navy-50 pb-32">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-700">Marketplace</p>
            <h1 className="font-display text-3xl font-semibold text-navy-950 md:text-5xl">Cars in Nigeria</h1>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-full bg-white px-4 py-3 ring-1 ring-black/5">
          <Search className="size-4 text-navy-700" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search make, model or city"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {carCategories.map((c) => (
            <Link
              key={c}
              to="/cars"
              search={{ filter: c }}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium ring-1 transition ${
                filter === c
                  ? "bg-navy-950 text-white ring-navy-950"
                  : "bg-white text-navy-950 ring-black/5 hover:ring-navy-700/30"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        <p className="mb-4 text-sm text-navy-700">
          <span className="font-semibold text-navy-950">{filtered.length}</span> car{filtered.length === 1 ? "" : "s"} available
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((car) => (
            <div key={car.id} className="overflow-hidden rounded-3xl bg-white p-3 ring-1 ring-black/5 transition hover:ring-navy-700/30 md:p-4">
              <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                <img src={car.image} alt={car.title} loading="lazy" className="size-full object-cover" />
                {car.verified && (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-500/20">
                    <BadgeCheck className="size-3" /> VERIFIED
                  </span>
                )}
                <span className="absolute right-3 top-3 rounded-full bg-navy-950 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {car.listingType === "Rent" ? "FOR RENT" : "FOR SALE"}
                </span>
              </div>
              <div className="mb-1 flex items-center justify-between text-xs font-medium text-navy-700">
                <span className="inline-flex items-center gap-1"><MapPin className="size-3" /> {car.city}</span>
                <span className="uppercase tracking-wider text-[10px]">{car.condition}</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-navy-950">
                {formatNaira(car.price)}{car.listingType === "Rent" ? " / day" : ""}
              </h3>
              <p className="mt-0.5 line-clamp-1 text-sm text-navy-700">{car.title}</p>
              <div className="mt-3 flex items-center gap-4 border-t border-black/5 pt-3 text-xs text-navy-700">
                <span className="inline-flex items-center gap-1"><Fuel className="size-3.5" /> {car.fuel}</span>
                <span className="inline-flex items-center gap-1"><Gauge className="size-3.5" /> {car.mileageKm.toLocaleString()} km</span>
                <span>{car.transmission}</span>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 rounded-3xl bg-white p-10 text-center ring-1 ring-black/5">
            <p className="font-display text-lg text-navy-950">No cars match your search.</p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
