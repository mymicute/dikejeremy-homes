import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, Search, Building2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/mock-data";
import type { Tables } from "@/integrations/supabase/types";

type Property = Tables<"properties">;

type BrowseSearch = {
  q?: string;
  type?: string;
  listingType?: "Buy" | "Rent" | "Short Let";
  beds?: number;
};

export const Route = createFileRoute("/browse")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): BrowseSearch => ({
    q: typeof s.q === "string" ? s.q : undefined,
    type: typeof s.type === "string" ? s.type : undefined,
    listingType: (["Buy", "Rent", "Short Let"] as const).includes(s.listingType as never)
      ? (s.listingType as BrowseSearch["listingType"])
      : undefined,
    beds: typeof s.beds === "number" ? s.beds : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse properties — Dejedy" },
      { name: "description", content: "Search verified properties for buy, rent and short-let across Nigeria." },
    ],
  }),
  component: Browse,
});

function Browse() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [q, setQ] = useState(search.q ?? "");
  const [showFilters, setShowFilters] = useState(false);
  const [items, setItems] = useState<Property[]>([]);

  useEffect(() => {
    supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, []);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      if (search.listingType && p.listing_type !== search.listingType) return false;
      if (search.type && search.type !== "Any" && p.property_type !== search.type) return false;
      if (search.beds && (p.beds ?? 0) < search.beds) return false;
      if (q) {
        const hay = `${p.title} ${p.location ?? ""} ${p.city ?? ""} ${p.state ?? ""} ${p.property_type}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [items, search, q]);

  return (
    <div className="min-h-screen bg-navy-50 pb-32">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-3 ring-1 ring-black/5">
            <Search className="size-4 text-navy-700" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by city, area, or type" className="flex-1 bg-transparent text-sm outline-none" />
          </div>
          <button onClick={() => setShowFilters((s) => !s)} className="inline-flex items-center justify-center gap-2 rounded-full bg-navy-950 px-5 py-3 text-sm font-medium text-white">
            <SlidersHorizontal className="size-4" /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="mb-6 grid gap-3 rounded-3xl bg-white p-5 ring-1 ring-black/5 md:grid-cols-4">
            <label className="text-xs font-medium">
              <span className="mb-1 block text-[10px] uppercase tracking-wider text-navy-700">Listing</span>
              <select value={search.listingType ?? ""} onChange={(e) => navigate({ search: (s: BrowseSearch) => ({ ...s, listingType: (e.target.value || undefined) as BrowseSearch["listingType"] }) })} className="w-full rounded-lg bg-navy-50 px-3 py-2">
                <option value="">Any</option><option>Buy</option><option>Rent</option><option>Short Let</option>
              </select>
            </label>
            <label className="text-xs font-medium">
              <span className="mb-1 block text-[10px] uppercase tracking-wider text-navy-700">Type</span>
              <select value={search.type ?? ""} onChange={(e) => navigate({ search: (s: BrowseSearch) => ({ ...s, type: e.target.value || undefined }) })} className="w-full rounded-lg bg-navy-50 px-3 py-2">
                <option value="">Any</option><option>Apartment</option><option>Duplex</option><option>Terrace</option><option>Studio</option><option>Land</option>
              </select>
            </label>
            <label className="text-xs font-medium">
              <span className="mb-1 block text-[10px] uppercase tracking-wider text-navy-700">Min beds</span>
              <input type="number" min={0} value={search.beds ?? ""} onChange={(e) => navigate({ search: (s: BrowseSearch) => ({ ...s, beds: e.target.value ? Number(e.target.value) : undefined }) })} className="w-full rounded-lg bg-navy-50 px-3 py-2" />
            </label>
            <Link to="/browse" className="self-end rounded-lg bg-navy-50 px-3 py-2 text-center text-xs font-medium text-navy-950 hover:bg-navy-950 hover:text-white">Clear</Link>
          </div>
        )}

        <p className="mb-4 text-sm text-navy-700">
          <span className="font-semibold text-navy-950">{filtered.length}</span> propert{filtered.length === 1 ? "y" : "ies"} found
        </p>

        {filtered.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-10 text-center ring-1 ring-black/5">
            <Building2 className="mx-auto size-8 text-navy-700" />
            <p className="mt-4 font-display text-lg text-navy-950">No properties yet.</p>
            <Link to="/list-property" className="mt-4 inline-block rounded-full bg-navy-950 px-5 py-2 text-sm text-white">
              List the first one
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <Link key={p.id} to="/property/$id" params={{ id: p.id }} className="group block overflow-hidden rounded-3xl bg-white p-3 ring-1 ring-black/5 hover:ring-navy-700/40">
                <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-2xl bg-navy-50">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.title} loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="grid size-full place-items-center text-navy-700"><Building2 className="size-8" /></div>
                  )}
                </div>
                <div className="mb-1 flex items-center justify-between text-xs font-medium text-navy-700">
                  <span>{p.city ?? p.location ?? "—"}</span>
                  <span className="uppercase tracking-wider text-[10px]">{p.listing_type}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-navy-950">{formatNaira(Number(p.price), p.listing_type)}</h3>
                <p className="mt-0.5 line-clamp-1 text-sm text-navy-700">{p.title}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
