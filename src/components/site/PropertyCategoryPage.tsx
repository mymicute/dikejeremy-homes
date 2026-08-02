import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Building2, Search } from "lucide-react";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/mock-data";
import type { Tables } from "@/integrations/supabase/types";

type Property = Tables<"properties">;

export function PropertyCategoryPage({
  eyebrow,
  title,
  blurb,
  types,
  listingTypes,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
  types: readonly string[];
  listingTypes?: readonly string[];
}) {
  const [items, setItems] = useState<Property[]>([]);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<string>("All");

  useEffect(() => {
    supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setItems(data ?? []));
  }, []);

  const inCategory = useMemo(
    () =>
      items.filter((p) => {
        const typeOk = types.some(
          (t) => (p.property_type ?? "").toLowerCase() === t.toLowerCase(),
        );
        const listingOk = listingTypes
          ? listingTypes.some((l) => (p.listing_type ?? "").toLowerCase() === l.toLowerCase())
          : false;
        return typeOk || listingOk;
      }),
    [items, types, listingTypes],
  );

  const filtered = useMemo(
    () =>
      inCategory.filter((p) => {
        if (tab !== "All" && (p.property_type ?? "").toLowerCase() !== tab.toLowerCase())
          return false;
        if (q) {
          const hay =
            `${p.title} ${p.location ?? ""} ${p.city ?? ""} ${p.state ?? ""} ${p.property_type}`.toLowerCase();
          if (!hay.includes(q.toLowerCase())) return false;
        }
        return true;
      }),
    [inCategory, tab, q],
  );

  return (
    <div className="min-h-screen bg-muted/40 pb-32">
      <Header />
      <main className="mx-auto w-full max-w-[900px] px-3 py-4 md:px-6 md:py-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="font-display text-2xl font-semibold text-foreground md:text-4xl">{title}</h1>
        <p className="mt-1 max-w-[60ch] text-sm text-muted-foreground">{blurb}</p>

        <div className="mt-4 flex items-center gap-2 rounded-full bg-card px-4 py-2.5 ring-1 ring-border">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search city, area or title"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
          />
        </div>

        <div className="-mx-3 mt-3 flex gap-2 overflow-x-auto px-3 pb-1">
          {["All", ...types].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-border ${
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground hover:bg-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{filtered.length}</span> listing
          {filtered.length === 1 ? "" : "s"}
        </p>

        {filtered.length === 0 ? (
          <div className="mt-4 rounded-2xl bg-card p-10 text-center ring-1 ring-border">
            <Building2 className="mx-auto size-8 text-muted-foreground" />
            <p className="mt-4 font-display text-lg text-foreground">Nothing here yet.</p>
            <Link
              to="/list-property"
              className="mt-4 inline-block rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground"
            >
              Post the first listing
            </Link>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const cover = p.image_urls?.[0] ?? p.image_url ?? null;
              return (
                <Link
                  key={p.id}
                  to="/property/$id"
                  params={{ id: p.id }}
                  className="group block overflow-hidden rounded-2xl bg-card p-3 ring-1 ring-border hover:ring-primary/40"
                >
                  <div className="mb-3 aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
                    {cover ? (
                      <img
                        src={cover}
                        alt={p.title}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-muted-foreground">
                        <Building2 className="size-7" />
                      </div>
                    )}
                  </div>
                  <p className="truncate text-sm font-semibold text-foreground">{p.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.city ?? p.location ?? "Nigeria"} · {p.property_type}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {formatNaira(Number(p.price), p.listing_type)}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
