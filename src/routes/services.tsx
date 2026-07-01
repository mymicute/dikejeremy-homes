import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BadgeCheck, Clock, MapPin, Search, Star, MessageCircle, Phone } from "lucide-react";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { services, serviceCategories, formatNaira } from "@/lib/marketplace-data";
import { getAgent } from "@/lib/mock-data";

type ServiceSearch = { q?: string; filter?: string };

export const Route = createFileRoute("/services")({
  validateSearch: (s: Record<string, unknown>): ServiceSearch => ({
    q: typeof s.q === "string" ? s.q : undefined,
    filter: typeof s.filter === "string" ? s.filter : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Home services in Nigeria — DikeJeremy" },
      { name: "description", content: "Book verified painting, cleaning, plumbing, electrical, carpentry and fumigation across Nigeria." },
      { property: "og:title", content: "Home services — DikeJeremy" },
      { property: "og:description", content: "Verified handymen and home service pros across Nigeria." },
    ],
  }),
  component: ServicesPage,
});

function ServicesPage() {
  const search = Route.useSearch();
  const [q, setQ] = useState(search.q ?? "");
  const filter = search.filter ?? "All";

  const filtered = useMemo(() => {
    return services.filter((s) => {
      if (filter !== "All" && s.category !== filter) return false;
      if (q) {
        const hay = `${s.title} ${s.category} ${s.city} ${s.description}`.toLowerCase();
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
            <h1 className="font-display text-3xl font-semibold text-navy-950 md:text-5xl">Home services</h1>
            <p className="mt-2 max-w-[52ch] text-sm text-navy-700">
              Verified painters, cleaners, plumbers, electricians and more. Book by chat, call or on-site visit.
            </p>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-full bg-white px-4 py-3 ring-1 ring-black/5">
          <Search className="size-4 text-navy-700" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="What do you need done today?"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {serviceCategories.map((c) => (
            <Link
              key={c}
              to="/services"
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((svc) => {
            const vendor = getAgent(svc.vendorId);
            return (
              <div key={svc.id} className="flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-black/5">
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img src={svc.image} alt={svc.title} loading="lazy" className="size-full object-cover" />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-navy-950 ring-1 ring-black/5">
                    {svc.category}
                  </span>
                  {svc.verified && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <BadgeCheck className="size-3" /> VERIFIED
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-semibold text-navy-950">{svc.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-navy-700">{svc.description}</p>

                  <div className="mt-3 flex items-center gap-3 text-xs text-navy-700">
                    <span className="inline-flex items-center gap-1"><Star className="size-3.5 fill-amber-400 text-amber-400" /> {svc.rating} ({svc.reviews})</span>
                    <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {svc.city}</span>
                    <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> ~{svc.responseTimeMins}m</span>
                  </div>

                  <div className="mt-4 flex items-end justify-between border-t border-black/5 pt-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-navy-700">From</p>
                      <p className="font-display text-lg font-semibold text-navy-950">
                        {formatNaira(svc.priceFrom)} <span className="text-xs font-normal text-navy-700">{svc.unit}</span>
                      </p>
                    </div>
                    {vendor && (
                      <div className="flex gap-2">
                        <a href={`tel:${vendor.phone}`} className="inline-flex size-9 items-center justify-center rounded-full bg-navy-50 text-navy-950 hover:bg-navy-950 hover:text-white">
                          <Phone className="size-4" />
                        </a>
                        <a
                          href={`https://wa.me/${vendor.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex size-9 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          <MessageCircle className="size-4" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="mt-16 rounded-3xl bg-white p-10 text-center ring-1 ring-black/5">
            <p className="font-display text-lg text-navy-950">No services match your search.</p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
