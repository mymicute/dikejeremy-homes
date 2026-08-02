import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  Plus,
  Building2,
  Sparkles,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  Image as ImageIcon,
  Video,
  BadgeCheck,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { formatNaira } from "@/lib/mock-data";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/")({
  ssr: false,
  component: Home,
});

type Profile = { full_name: string | null; avatar_url: string | null };
type Property = Tables<"properties"> & { profiles: Profile | null };
type StatusPost = Tables<"status_posts">;
type StatusWithProfile = StatusPost & { profiles: Profile | null };

function initialsOf(name?: string | null) {
  return (name ?? "U")
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d` : new Date(iso).toLocaleDateString();
}

function Home() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [statuses, setStatuses] = useState<StatusWithProfile[]>([]);
  const [viewing, setViewing] = useState<StatusWithProfile | null>(null);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const { data: userData } = await supabase.auth.getUser();
      const currentId = userData.user?.id;

      const { data: pData } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      const propRows = pData ?? [];

      const { data: sData } = await supabase
        .from("status_posts")
        .select("*")
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(24);
      const statusRows = sData ?? [];

      const ids = Array.from(
        new Set([...statusRows.map((r) => r.user_id), ...propRows.map((r) => r.owner_id)]),
      );
      const profilesMap = new Map<string, Profile>();
      if (ids.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", ids);
        (profs ?? []).forEach((p) =>
          profilesMap.set(p.id, { full_name: p.full_name, avatar_url: p.avatar_url }),
        );
      }

      setProperties(propRows.map((r) => ({ ...r, profiles: profilesMap.get(r.owner_id) ?? null })));

      const withProfiles = statusRows.map((r) => ({
        ...r,
        profiles: profilesMap.get(r.user_id) ?? null,
      }));
      withProfiles.sort(
        (a, b) => (a.user_id === currentId ? 0 : 1) - (b.user_id === currentId ? 0 : 1),
      );
      setStatuses(withProfiles);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-muted/40 pb-32">
      <Header />

      <main className="mx-auto w-full max-w-[600px] px-3 py-4 md:px-0 md:py-6">
        {/* Search bar */}
        <form
          action="/browse"
          className="mb-3 flex items-center gap-2 rounded-full bg-card px-4 py-2.5 ring-1 ring-border"
        >
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            name="q"
            type="text"
            placeholder="Search Dejedy — Lekki, Maitama, cars, services…"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/70"
          />
        </form>

        {/* Stories / statuses */}
        <section className="mb-3 rounded-2xl bg-card p-3 ring-1 ring-border">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </h2>
            <Link
              to="/status/new"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Sparkles className="size-3" /> Post yours
            </Link>
          </div>
          <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1">
            <Link to="/status/new" className="flex w-16 shrink-0 flex-col items-center gap-1.5">
              <div className="grid size-16 place-items-center rounded-full bg-muted ring-2 ring-dashed ring-border text-muted-foreground">
                <Plus className="size-5" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">Add</span>
            </Link>
            {statuses.map((s) => {
              const name = s.profiles?.full_name?.split(" ")[0] ?? "User";
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setViewing(s)}
                  className="flex w-16 shrink-0 flex-col items-center gap-1.5"
                >
                  <div className="flex size-16 items-center justify-center rounded-full bg-card p-0.5 ring-2 ring-primary">
                    <div className="grid size-full overflow-hidden rounded-full bg-primary text-primary-foreground">
                      {s.image_url ? (
                        <img src={s.image_url} alt={name} className="size-full object-cover" />
                      ) : s.profiles?.avatar_url ? (
                        <img
                          src={s.profiles.avatar_url}
                          alt={name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="grid size-full place-items-center text-sm font-semibold">
                          {initialsOf(s.profiles?.full_name)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="w-full truncate text-center text-[11px] font-medium text-foreground">
                    {name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Composer */}
        <section className="mb-3 rounded-2xl bg-card p-3 ring-1 ring-border">
          <div className="flex items-center gap-2">
            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              <Building2 className="size-4" />
            </div>
            <Link
              to="/list-property"
              className="flex-1 rounded-full bg-muted px-4 py-2.5 text-sm text-muted-foreground"
            >
              What are you listing today?
            </Link>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <Link
              to="/list-property"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              <ImageIcon className="size-4 text-emerald-600" /> Photos
            </Link>
            <Link
              to="/list-property"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              <Video className="size-4 text-red-500" /> Video
            </Link>
            <Link
              to="/map"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              <MapPin className="size-4 text-sky-600" /> Map
            </Link>
          </div>
        </section>

        {/* Feed */}
        {properties.length === 0 ? (
          <section className="rounded-2xl bg-card p-10 text-center ring-1 ring-border">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-muted">
              <Building2 className="size-7 text-muted-foreground" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold text-foreground">
              No posts yet
            </h2>
            <p className="mx-auto mt-2 max-w-[40ch] text-sm text-muted-foreground">
              Your feed is empty. Post the first listing to get it started.
            </p>
            <Link
              to="/list-property"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              <Plus className="size-4" /> Create post
            </Link>
          </section>
        ) : (
          <div className="space-y-3">
            {properties.map((p) => {
              const images = p.image_urls?.length ? p.image_urls : p.image_url ? [p.image_url] : [];
              const name = p.profiles?.full_name ?? "Dejedy user";
              return (
                <article key={p.id} className="rounded-2xl bg-card ring-1 ring-border">
                  {/* Post header */}
                  <div className="flex items-center gap-3 p-3">
                    <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {p.profiles?.avatar_url ? (
                        <img src={p.profiles.avatar_url} alt="" className="size-full object-cover" />
                      ) : (
                        initialsOf(p.profiles?.full_name)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 truncate text-sm font-semibold text-foreground">
                        {name} <BadgeCheck className="size-3.5 shrink-0 text-sky-600" />
                      </p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {timeAgo(p.created_at)} · {p.city ?? p.location ?? "Nigeria"} ·{" "}
                        {p.property_type}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground">
                      {p.listing_type}
                    </span>
                  </div>

                  {/* Post body */}
                  <div className="px-3 pb-3">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">
                        {formatNaira(Number(p.price), p.listing_type)}
                      </span>{" "}
                      — {p.title}
                    </p>
                    {p.description && (
                      <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                        {p.description}
                      </p>
                    )}
                  </div>

                  {/* Media */}
                  <Link to="/property/$id" params={{ id: p.id }} className="block">
                    {images.length > 0 ? (
                      images.length === 1 ? (
                        <img
                          src={images[0]}
                          alt={p.title}
                          loading="lazy"
                          className="max-h-[520px] w-full bg-muted object-cover"
                        />
                      ) : (
                        <div className="grid grid-cols-2 gap-0.5 bg-muted">
                          {images.slice(0, 4).map((src, i) => (
                            <div key={src + i} className="relative aspect-square overflow-hidden">
                              <img
                                src={src}
                                alt={p.title}
                                loading="lazy"
                                className="size-full object-cover"
                              />
                              {i === 3 && images.length > 4 && (
                                <span className="absolute inset-0 grid place-items-center bg-black/50 text-lg font-semibold text-white">
                                  +{images.length - 4}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )
                    ) : (
                      <div className="grid aspect-[16/9] w-full place-items-center bg-muted text-muted-foreground">
                        <Building2 className="size-8" />
                      </div>
                    )}
                  </Link>

                  {/* Stats + actions */}
                  <div className="flex items-center justify-between px-3 py-2 text-[11px] text-muted-foreground">
                    <span>
                      {p.beds ? `${p.beds} bed` : ""}
                      {p.beds && p.baths ? " · " : ""}
                      {p.baths ? `${p.baths} bath` : ""}
                      {p.size_sqm ? ` · ${p.size_sqm} sqm` : ""}
                    </span>
                    <span>{liked[p.id] ? "You like this" : ""}</span>
                  </div>
                  <div className="flex items-center border-t border-border">
                    <button
                      type="button"
                      onClick={() => setLiked((s) => ({ ...s, [p.id]: !s[p.id] }))}
                      className={`inline-flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium hover:bg-muted ${
                        liked[p.id] ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      <ThumbsUp className="size-4" /> Like
                    </button>
                    <Link
                      to="/property/$id"
                      params={{ id: p.id }}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                    >
                      <MessageSquare className="size-4" /> Enquire
                    </Link>
                    <Link
                      to="/favorites"
                      className="inline-flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                    >
                      <Bookmark className="size-4" /> Save
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}/property/${p.id}`;
                        if (navigator.share) navigator.share({ title: p.title, url });
                        else navigator.clipboard?.writeText(url);
                      }}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                    >
                      <Share2 className="size-4" /> Share
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      <BottomNav />

      {viewing && (
        <div
          onClick={() => setViewing(null)}
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-card ring-1 ring-border"
          >
            <div className="flex items-center gap-3 p-4">
              <div className="grid size-10 place-items-center overflow-hidden rounded-full bg-primary text-primary-foreground">
                {viewing.profiles?.avatar_url ? (
                  <img src={viewing.profiles.avatar_url} alt="" className="size-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold">
                    {initialsOf(viewing.profiles?.full_name)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {viewing.profiles?.full_name ?? "User"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(viewing.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setViewing(null)}
                className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground"
              >
                Close
              </button>
            </div>
            <img
              src={viewing.image_url}
              alt="Status"
              className="max-h-[70vh] w-full bg-black object-contain"
            />
            {viewing.caption && <p className="p-4 text-sm text-foreground">{viewing.caption}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
