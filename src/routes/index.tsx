import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search, MapPin, TrendingUp, ArrowRight, Plus, Building2, Users, Sparkles } from "lucide-react";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { categories, trendingLocations, formatNaira } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/")({
  ssr: false,
  component: Home,
});

type Property = Tables<"properties">;
type StatusPost = Tables<"status_posts">;
type StatusWithProfile = StatusPost & {
  profiles: Pick<Tables<"profiles">, "full_name" | "avatar_url"> | null;
};

function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [statuses, setStatuses] = useState<StatusWithProfile[]>([]);

  useEffect(() => {
    supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(24)
      .then(({ data }) => setProperties(data ?? []));

    (async () => {
      const { data: sData } = await supabase
        .from("status_posts")
        .select("*")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(24);
      const rows = sData ?? [];
      const ids = Array.from(new Set(rows.map((r) => r.user_id)));
      const profilesMap = new Map<string, { full_name: string | null; avatar_url: string | null }>();
      if (ids.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", ids);
        (profs ?? []).forEach((p) => profilesMap.set(p.id, { full_name: p.full_name, avatar_url: p.avatar_url }));
      }
      setStatuses(rows.map((r) => ({ ...r, profiles: profilesMap.get(r.user_id) ?? null })));
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        {/* Hero Search */}
        <section className="mb-10 md:mb-12">
          <h1 className="mb-6 max-w-[20ch] text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:mb-8 md:text-6xl">
            Find your place in the heart of Nigeria.
          </h1>

          <form
            action="/browse"
            className="flex w-full flex-col items-stretch gap-2 rounded-3xl bg-card p-2 ring-1 ring-border md:flex-row md:items-center md:rounded-2xl"
          >
            <label className="flex flex-1 flex-col px-4 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Location</span>
              <input
                name="q"
                type="text"
                placeholder="Lekki, Maitama, Old GRA…"
                className="bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/60"
              />
            </label>
            <div className="hidden h-10 w-px bg-border md:block" />
            <label className="flex flex-1 flex-col px-4 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Type</span>
              <select name="type" className="bg-transparent text-sm font-medium text-foreground outline-none">
                <option>Any</option>
                <option>Apartment</option>
                <option>Duplex</option>
                <option>Terrace</option>
                <option>Land</option>
                <option>Studio</option>
              </select>
            </label>
            <div className="hidden h-10 w-px bg-border md:block" />
            <label className="flex flex-1 flex-col px-4 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Listing</span>
              <select name="listingType" className="bg-transparent text-sm font-medium text-foreground outline-none">
                <option>Buy</option>
                <option>Rent</option>
                <option>Short Let</option>
              </select>
            </label>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 md:rounded-xl md:px-8"
            >
              <Search className="size-4" /> Search
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            {categories.slice(0, 8).map((c) => (
              <Link
                key={c}
                to="/browse"
                search={{ type: c } as never}
                className="rounded-full bg-card px-3 py-1.5 text-xs font-medium text-foreground ring-1 ring-border hover:bg-primary hover:text-primary-foreground"
              >
                {c}
              </Link>
            ))}
          </div>
        </section>

        {/* Status rings */}
        <section className="mb-10 -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Status Updates
            </h2>
            <Link to="/status/new" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
              <Sparkles className="size-3" /> Post yours
            </Link>
          </div>
          <div className="flex gap-5 pb-2">
            <Link to="/status/new" className="flex flex-col items-center gap-2">
              <div className="grid size-16 place-items-center rounded-full bg-card ring-2 ring-dashed ring-border text-muted-foreground">
                <Plus className="size-5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Add</span>
            </Link>
            {statuses.map((s) => {
              const name = s.profiles?.full_name?.split(" ")[0] ?? "User";
              const initials = (s.profiles?.full_name ?? "U")
                .split(" ")
                .map((x) => x[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              return (
                <div key={s.id} className="flex flex-col items-center gap-2">
                  <div className="flex size-16 items-center justify-center rounded-full bg-background p-1 ring-2 ring-primary">
                    <div className="grid size-full overflow-hidden rounded-full bg-primary text-primary-foreground">
                      {s.profiles?.avatar_url ? (
                        <img src={s.profiles.avatar_url} alt={name} className="size-full object-cover" />
                      ) : s.image_url ? (
                        <img src={s.image_url} alt={name} className="size-full object-cover" />
                      ) : (
                        <span className="grid size-full place-items-center text-sm font-semibold">{initials}</span>
                      )}
                    </div>
                  </div>
                  <span className="max-w-[64px] truncate text-xs font-medium text-foreground">{name}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Feed */}
        {properties.length === 0 ? (
          <section className="rounded-3xl bg-card p-10 text-center ring-1 ring-border md:p-16">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-muted">
              <Building2 className="size-7 text-muted-foreground" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold text-foreground">No listings yet</h2>
            <p className="mx-auto mt-2 max-w-[46ch] text-sm text-muted-foreground">
              Your feed is empty. Post the first property to get it started.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Link
                to="/list-property"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                <Plus className="size-4" /> Add listing
              </Link>
              <Link
                to="/map"
                className="inline-flex items-center gap-2 rounded-full bg-card px-5 py-2.5 text-sm font-medium text-foreground ring-1 ring-border hover:bg-accent"
              >
                <MapPin className="size-4" /> Open map
              </Link>
            </div>
          </section>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6">
            {properties.map((p) => (
              <Link
                key={p.id}
                to="/"
                className="group block overflow-hidden rounded-3xl bg-card p-3 ring-1 ring-border transition hover:ring-primary/40 md:p-4"
              >
                <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-2xl bg-muted">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.title}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="grid size-full place-items-center text-muted-foreground">
                      <Building2 className="size-8" />
                    </div>
                  )}
                </div>
                <div className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>{p.city ?? p.location ?? "—"}</span>
                  <span className="uppercase tracking-wider text-[10px]">{p.listing_type}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {formatNaira(Number(p.price), p.listing_type)}
                </h3>
                <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{p.title}</p>
              </Link>
            ))}
          </div>
        )}

        {/* Discover cards */}
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Link to="/map" className="group flex items-center justify-between rounded-3xl bg-card p-6 ring-1 ring-border">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Explore</p>
              <h3 className="mt-1 font-display text-xl font-semibold text-foreground">Map view</h3>
              <p className="mt-1 text-sm text-muted-foreground">Browse listings across Nigeria on the map.</p>
            </div>
            <MapPin className="size-5 text-foreground transition group-hover:translate-x-1" />
          </Link>
          <Link to="/cars" className="group flex items-center justify-between rounded-3xl bg-primary p-6 text-primary-foreground">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">Marketplace</p>
              <h3 className="mt-1 font-display text-xl font-semibold">Cars — buy & rent</h3>
              <p className="mt-1 text-sm opacity-80">Add cars for sale or daily rental.</p>
            </div>
            <ArrowRight className="size-5 transition group-hover:translate-x-1" />
          </Link>
          <Link to="/services" className="group flex items-center justify-between rounded-3xl bg-card p-6 ring-1 ring-border">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Home services</p>
              <h3 className="mt-1 font-display text-xl font-semibold text-foreground">Painting, plumbing…</h3>
              <p className="mt-1 text-sm text-muted-foreground">List professional home services.</p>
            </div>
            <ArrowRight className="size-5 text-foreground transition group-hover:translate-x-1" />
          </Link>
        </section>

        {/* Trending + Agents CTA */}
        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-primary p-6 text-primary-foreground">
            <h4 className="mb-4 inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider opacity-70">
              <TrendingUp className="size-3.5" /> Trending locations
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
                  <span className="text-[10px] opacity-80">{t.delta}</span>
                </li>
              ))}
            </ul>
          </div>
          <Link to="/agents" className="group flex items-center justify-between rounded-3xl bg-card p-6 ring-1 ring-border">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Vendors</p>
              <h3 className="mt-1 font-display text-xl font-semibold text-foreground">Add agents & vendors</h3>
              <p className="mt-1 text-sm text-muted-foreground">Verified agents, landlords, developers and companies.</p>
            </div>
            <Users className="size-5 text-foreground transition group-hover:translate-x-1" />
          </Link>
        </section>
      </main>

      <footer className="mx-auto max-w-7xl px-6 pb-16 pt-8 text-center">
        <p className="mx-auto max-w-[56ch] text-pretty text-sm text-muted-foreground">
          DikeJeremy — Nigeria's marketplace for real estate, cars and home services.
        </p>
      </footer>

      <BottomNav />
    </div>
  );
}
