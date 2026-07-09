import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal, Search } from "lucide-react";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { PropertyCard } from "@/components/site/PropertyCard";
import { properties, categories } from "@/lib/mock-data";

type BrowseSearch = {
  q?: string;
  type?: string;
  listingType?: "Buy" | "Rent" | "Short Let";
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
};

export const Route = createFileRoute("/browse")({
  validateSearch: (s: Record<string, unknown>): BrowseSearch => ({
    q: typeof s.q === "string" ? s.q : undefined,
    type: typeof s.type === "string" ? s.type : undefined,
    listingType: (["Buy", "Rent", "Short Let"] as const).includes(s.listingType as never)
      ? (s.listingType as BrowseSearch["listingType"])
      : undefined,
    minPrice: typeof s.minPrice === "number" ? s.minPrice : undefined,
    maxPrice: typeof s.maxPrice === "number" ? s.maxPrice : undefined,
    beds: typeof s.beds === "number" ? s.beds : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse properties — Dejedy" },
      { name: "description", content: "Search verified properties for buy, rent and short-let across Nigeria." },
      { property: "og:title", content: "Browse properties — Dejedy" },
      { property: "og:description", content: "Filter by location, price, bedrooms and more." },
    ],
  }),
  component: Browse,
});

function Browse() {
  const search = Route.useSearch();
  const [q, setQ] = useState(search.q ?? "");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (search.listingType && p.listingType !== search.listingType) return false;
      if (search.type && search.type !== "Any" && p.type !== search.type) return false;
      if (search.beds && p.beds < search.beds) return false;
      if (q) {
        const needle = q.toLowerCase();
        const hay = `${p.title} ${p.area} ${p.city} ${p.state} ${p.type}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [search, q]);

  const navigate = Route.useNavigate();

  return (
    <div className="min-h-screen bg-navy-50 pb-32">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-3 ring-1 ring-black/5">
            <Search className="size-4 text-navy-700" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by city, area, or type"
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-navy-950 px-5 py-3 text-sm font-medium text-white"
          >
            <SlidersHorizontal className="size-4" /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="mb-6 grid gap-3 rounded-3xl bg-white p-5 ring-1 ring-black/5 md:grid-cols-4">
            <label className="text-xs font-medium">
              <span className="mb-1 block text-[10px] uppercase tracking-wider text-navy-700">Listing</span>
              <select
                value={search.listingType ?? ""}
                onChange={(e) => navigate({ search: (s: BrowseSearch) => ({ ...s, listingType: (e.target.value || undefined) as BrowseSearch["listingType"] }) })}
                className="w-full rounded-lg bg-navy-50 px-3 py-2"
              >
                <option value="">Any</option>
                <option>Buy</option>
                <option>Rent</option>
                <option>Short Let</option>
              </select>
            </label>
            <label className="text-xs font-medium">
              <span className="mb-1 block text-[10px] uppercase tracking-wider text-navy-700">Type</span>
              <select
                value={search.type ?? ""}
                onChange={(e) => navigate({ search: (s: BrowseSearch) => ({ ...s, type: e.target.value || undefined }) })}
                className="w-full rounded-lg bg-navy-50 px-3 py-2"
              >
                <option value="">Any</option>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="text-xs font-medium">
              <span className="mb-1 block text-[10px] uppercase tracking-wider text-navy-700">Min beds</span>
              <input
                type="number"
                min={0}
                value={search.beds ?? ""}
                onChange={(e) => navigate({ search: (s: BrowseSearch) => ({ ...s, beds: e.target.value ? Number(e.target.value) : undefined }) })}
                className="w-full rounded-lg bg-navy-50 px-3 py-2"
              />
            </label>
            <Link
              to="/browse"
              className="self-end rounded-lg bg-navy-50 px-3 py-2 text-center text-xs font-medium text-navy-950 hover:bg-navy-950 hover:text-white"
            >
              Clear
            </Link>
          </div>
        )}

        <p className="mb-4 text-sm text-navy-700">
          <span className="font-semibold text-navy-950">{filtered.length}</span> propert{filtered.length === 1 ? "y" : "ies"} found
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 rounded-3xl bg-white p-10 text-center ring-1 ring-black/5">
            <p className="font-display text-lg text-navy-950">No properties match your filters.</p>
            <p className="mt-2 text-sm text-navy-700">Try clearing filters or searching a different area.</p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
