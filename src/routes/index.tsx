import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, MapPin, TrendingUp, ArrowRight, BadgeCheck } from "lucide-react";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { PropertyCard } from "@/components/site/PropertyCard";
import { StatusRing } from "@/components/site/StatusRing";
import {
  properties,
  agents,
  categories,
  trendingLocations,
  formatNaira,
} from "@/lib/mock-data";
import mapImage from "@/assets/map-lagos.jpg";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const featured = properties[0];
  const map = properties.slice(0, 6);
  const rest = properties.slice(1, 5);

  return (
    <div className="min-h-screen bg-navy-50 pb-32">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {/* Hero Search */}
        <section className="mb-10 md:mb-12">
          <h1 className="mb-6 max-w-[20ch] text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-navy-950 md:mb-8 md:text-6xl">
            Find your place in the heart of Nigeria.
          </h1>

          <form
            action="/browse"
            className="flex w-full flex-col items-stretch gap-2 rounded-3xl bg-white p-2 ring-1 ring-black/5 md:flex-row md:items-center md:rounded-2xl"
          >
            <label className="flex flex-1 flex-col px-4 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-navy-700">Location</span>
              <input
                name="q"
                type="text"
                placeholder="Lekki, Maitama, Old GRA…"
                className="bg-transparent text-sm font-medium text-navy-950 outline-none placeholder:text-navy-700/50"
              />
            </label>
            <div className="hidden h-10 w-px bg-black/5 md:block" />
            <label className="flex flex-1 flex-col px-4 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-navy-700">Type</span>
              <select name="type" className="bg-transparent text-sm font-medium text-navy-950 outline-none">
                <option>Any</option>
                <option>Apartment</option>
                <option>Duplex</option>
                <option>Terrace</option>
                <option>Land</option>
                <option>Studio</option>
              </select>
            </label>
            <div className="hidden h-10 w-px bg-black/5 md:block" />
            <label className="flex flex-1 flex-col px-4 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-navy-700">Listing</span>
              <select name="listingType" className="bg-transparent text-sm font-medium text-navy-950 outline-none">
                <option>Buy</option>
                <option>Rent</option>
                <option>Short Let</option>
              </select>
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-navy-950 px-6 py-4 text-sm font-medium text-white transition hover:opacity-90 md:rounded-xl md:px-8"
            >
              <Search className="size-4" /> Search
            </button>
          </form>

          {/* Category chips */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.slice(0, 8).map((c) => (
              <Link
                key={c}
                to="/browse"
                search={{ type: c } as never}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-navy-950 ring-1 ring-black/5 hover:bg-navy-950 hover:text-white"
              >
                {c}
              </Link>
            ))}
          </div>
        </section>

        {/* Status rings */}
        <section className="mb-10 -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-navy-700">
              Vendor Updates
            </h2>
            <Link to="/agents" className="text-xs font-medium text-navy-700 hover:text-navy-950">
              See all →
            </Link>
          </div>
          <div className="flex gap-5 pb-2">
            {agents.map((a) => (
              <Link key={a.id} to="/agents/$id" params={{ id: a.id }}>
                <StatusRing agent={a} />
              </Link>
            ))}
          </div>
        </section>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
          {/* Featured */}
          <Link
            to="/property/$id"
            params={{ id: featured.id }}
            className="group relative col-span-1 overflow-hidden rounded-3xl bg-white p-4 ring-1 ring-black/5 md:col-span-2 md:row-span-2"
          >
            <div className="mb-4 aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted">
              <img
                src={featured.images[0]}
                alt={featured.title}
                width={1200}
                height={1408}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>
            <div className="flex items-end justify-between">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    <BadgeCheck className="size-3" /> VERIFIED
                  </span>
                  <span className="text-xs font-medium text-navy-700">
                    {featured.area}, {featured.city}
                  </span>
                </div>
                <h3 className="font-display text-3xl font-semibold text-navy-950">
                  {formatNaira(featured.price, featured.listingType)}
                </h3>
                <p className="mt-1 text-sm text-navy-700">{featured.title}</p>
              </div>
              <span className="hidden rounded-full bg-navy-950 p-3 text-white transition group-hover:translate-x-1 md:inline-flex">
                <ArrowRight className="size-4" />
              </span>
            </div>
          </Link>

          {/* Map */}
          <Link
            to="/map"
            className="group col-span-1 overflow-hidden rounded-3xl bg-white ring-1 ring-black/5 md:col-span-2"
          >
            <div className="relative h-64 w-full">
              <img
                src={mapImage}
                alt="Map of Lagos properties"
                loading="lazy"
                width={1024}
                height={512}
                className="size-full object-cover"
              />
              <div className="absolute inset-4 flex flex-col justify-between">
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-black/5">
                  <MapPin className="size-3 text-navy-950" />
                  <span className="text-xs font-semibold">
                    {map.length} properties in Lagos
                  </span>
                </div>
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-navy-950 px-3 py-1.5 text-xs font-medium text-white">
                  Explore map <ArrowRight className="size-3" />
                </span>
              </div>
            </div>
          </Link>

          {/* Categories */}
          <div className="col-span-1 space-y-3 rounded-3xl bg-white p-6 ring-1 ring-black/5">
            <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-navy-700">
              Browse
            </h4>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 6).map((c) => (
                <Link
                  key={c}
                  to="/browse"
                  search={{ type: c } as never}
                  className="rounded-lg bg-navy-50 px-3 py-1.5 text-xs font-medium text-navy-950 hover:bg-navy-950 hover:text-white"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div className="col-span-1 rounded-3xl bg-navy-950 p-6 text-white">
            <h4 className="mb-4 inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-navy-50/60">
              <TrendingUp className="size-3.5" /> Trending
            </h4>
            <ul className="space-y-3">
              {trendingLocations.map((t, i) => (
                <li
                  key={t.name}
                  className={`flex items-center justify-between ${
                    i < trendingLocations.length - 1 ? "border-b border-white/10 pb-3" : ""
                  }`}
                >
                  <span className="text-sm">{t.name}</span>
                  <span className="text-[10px] text-emerald-300">{t.delta}</span>
                </li>
              ))}
            </ul>
          </div>

          {rest.map((p) => (
            <PropertyCard key={p.id} property={p} size="sm" />
          ))}
        </div>

        {/* Marketplace expansion */}
        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <Link to="/cars" className="group flex items-center justify-between rounded-3xl bg-navy-950 p-6 text-white ring-1 ring-black/5 md:p-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-navy-50/60">Also on DikeJeremy</p>
              <h3 className="mt-1 font-display text-2xl font-semibold">Cars — buy & rent</h3>
              <p className="mt-1 text-sm text-navy-50/80">Verified Nigerian, foreign used and brand new listings.</p>
            </div>
            <ArrowRight className="size-5 transition group-hover:translate-x-1" />
          </Link>
          <Link to="/services" className="group flex items-center justify-between rounded-3xl bg-white p-6 ring-1 ring-black/5 md:p-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-navy-700">Home services</p>
              <h3 className="mt-1 font-display text-2xl font-semibold text-navy-950">Painting, cleaning, plumbing…</h3>
              <p className="mt-1 text-sm text-navy-700">Book verified pros for home upgrades and repairs.</p>
            </div>
            <ArrowRight className="size-5 text-navy-950 transition group-hover:translate-x-1" />
          </Link>
        </section>

        {/* Verified vendor spotlight */}
        <section className="mt-12 rounded-3xl bg-white p-6 ring-1 ring-black/5 md:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-navy-950">
              Verified vendors
            </h2>
            <Link to="/agents" className="text-sm font-medium text-navy-700 hover:text-navy-950">
              See all →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {agents.filter(a => a.verified).slice(0, 3).map((a) => (
              <Link
                key={a.id}
                to="/agents/$id"
                params={{ id: a.id }}
                className="flex items-center gap-4 rounded-2xl bg-navy-50 p-4 ring-1 ring-black/5 transition hover:ring-navy-700/40"
              >
                <div className="grid size-14 place-items-center rounded-full bg-navy-950 font-display font-semibold text-white">
                  {a.avatarInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-display font-semibold text-navy-950">{a.name}</p>
                    <BadgeCheck className="size-4 text-emerald-600" />
                  </div>
                  <p className="text-xs text-navy-700">{a.role} · {a.city}</p>
                  <p className="mt-1 text-xs text-navy-700">
                    ⭐ {a.rating} · {a.listings} listings
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-7xl px-6 pb-16 pt-8 text-center">
        <p className="mx-auto max-w-[56ch] text-pretty text-sm text-navy-700">
          DikeJeremy is Nigeria's marketplace for premium real estate. Every listing is verified by our on-ground team across Lagos, Abuja and Port Harcourt.
        </p>
      </footer>

      <BottomNav />
    </div>
  );
}
