import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, ShoppingBag, Zap } from "lucide-react";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { electronicsCategories } from "@/lib/marketplace-data";

type ElectronicsSearch = { q?: string; filter?: string };

export const Route = createFileRoute("/electronics")({
  validateSearch: (s: Record<string, unknown>): ElectronicsSearch => ({
    q: typeof s.q === "string" ? s.q : undefined,
    filter: typeof s.filter === "string" ? s.filter : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Electronics in Nigeria — Dejedy" },
      { name: "description", content: "Buy and sell phones, laptops, TVs, audio, gaming and home appliances across Nigeria." },
      { property: "og:title", content: "Electronics — Dejedy" },
      { property: "og:description", content: "Nigeria's marketplace for phones, laptops, TVs and appliances." },
    ],
  }),
  component: ElectronicsPage,
});

// Placeholder: electronics listings will be user-generated later.
const items: Array<{ id: string; title: string; category: string; price: number; city: string; image: string; condition: string }> = [];

function ElectronicsPage() {
  const search = Route.useSearch();
  const [q, setQ] = useState(search.q ?? "");
  const filter = search.filter ?? "All";

  const filtered = useMemo(
    () => items.filter((i) => (filter === "All" || i.category === filter) && (!q || i.title.toLowerCase().includes(q.toLowerCase()))),
    [filter, q],
  );

  return (
    <div className="min-h-screen bg-navy-50 pb-32 dark:bg-navy-950">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-navy-700">Marketplace</p>
            <h1 className="font-display text-3xl font-semibold text-navy-950 md:text-5xl dark:text-white">Electronics</h1>
            <p className="mt-2 max-w-[52ch] text-sm text-navy-700">
              Phones, laptops, TVs, audio, gaming consoles and home appliances — brand new and used.
            </p>
          </div>
          <Link to="/list-property" className="hidden rounded-full bg-navy-950 px-5 py-2.5 text-sm font-medium text-white md:inline-flex md:items-center md:gap-2">
            <Zap className="size-4" /> Sell yours
          </Link>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-full bg-white px-4 py-3 ring-1 ring-black/5">
          <Search className="size-4 text-navy-700" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search phones, laptops, TVs…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-navy-700/70"
          />
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {electronicsCategories.map((c) => (
            <Link
              key={c}
              to="/electronics"
              search={{ filter: c === "All" ? undefined : c, q: q || undefined }}
              className={`rounded-full px-4 py-1.5 text-xs font-medium ring-1 ${
                filter === c ? "bg-navy-950 text-white ring-navy-950" : "bg-white text-navy-950 ring-black/5"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="grid place-items-center rounded-3xl bg-white p-16 text-center ring-1 ring-black/5">
            <ShoppingBag className="size-8 text-navy-700" />
            <h2 className="mt-3 font-display text-lg font-semibold text-navy-950">No electronics listed yet</h2>
            <p className="mt-1 max-w-[42ch] text-sm text-navy-700">
              Be the first to list a phone, laptop or appliance. Sellers get free visibility across Nigeria.
            </p>
            <Link to="/list-property" className="mt-4 inline-flex items-center gap-2 rounded-full bg-navy-950 px-5 py-2 text-sm text-white">
              <Zap className="size-4" /> Post an item
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {filtered.map((i) => (
              <article key={i.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
                <img src={i.image} alt={i.title} className="aspect-square w-full object-cover" />
                <div className="p-3">
                  <p className="line-clamp-1 text-sm font-semibold text-navy-950">{i.title}</p>
                  <p className="text-xs text-navy-700">{i.city} · {i.condition}</p>
                  <p className="mt-1 font-display text-sm font-semibold text-navy-950">₦{i.price.toLocaleString()}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
