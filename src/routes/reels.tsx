import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Heart, MessageSquare, Share2, Video as VideoIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/mock-data";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/reels")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reels — swipe through Nigerian property videos | Dejedy" },
      {
        name: "description",
        content:
          "Swipe vertical video tours of homes, cars and services listed on Dejedy — Nigeria's property and marketplace feed.",
      },
      { property: "og:title", content: "Dejedy Reels — swipe property video tours" },
      {
        property: "og:description",
        content: "Vertical video tours of Nigerian homes, cars and services.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Reels,
});

type Property = Tables<"properties">;
type Reel = { id: string; url: string; property: Property };

function Reels() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        const rows = (data ?? []) as Property[];
        const out: Reel[] = [];
        rows.forEach((p) => {
          (p.video_urls ?? []).forEach((url, i) => {
            if (url) out.push({ id: `${p.id}-${i}`, url, property: p });
          });
        });
        setReels(out);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (reels.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLVideoElement;
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            el.play().catch(() => {});
          } else {
            el.pause();
          }
        });
      },
      { threshold: [0, 0.6, 1] },
    );
    Object.values(videoRefs.current).forEach((v) => v && observer.observe(v));
    return () => observer.disconnect();
  }, [reels]);

  return (
    <div className="fixed inset-0 z-40 bg-black">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center gap-3 bg-gradient-to-b from-black/70 to-transparent p-4">
        <Link
          to="/"
          className="pointer-events-auto grid size-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur"
          aria-label="Back to feed"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="font-display text-lg font-semibold text-white">Reels</h1>
      </div>

      {loading ? (
        <div className="grid h-full place-items-center text-sm text-white/70">Loading reels…</div>
      ) : reels.length === 0 ? (
        <div className="grid h-full place-items-center px-8 text-center">
          <div>
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-white/10 text-white">
              <VideoIcon className="size-7" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold text-white">No reels yet</h2>
            <p className="mx-auto mt-2 max-w-[36ch] text-sm text-white/70">
              Add a video when you post a listing and it shows up here as a swipeable reel.
            </p>
            <Link
              to="/list-property"
              className="mt-5 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black"
            >
              Post a listing with video
            </Link>
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="h-full snap-y snap-mandatory overflow-y-scroll overscroll-contain"
        >
          {reels.map((r) => {
            const p = r.property;
            return (
              <section
                key={r.id}
                className="relative flex h-full w-full snap-start items-center justify-center"
              >
                <video
                  ref={(el) => {
                    videoRefs.current[r.id] = el;
                  }}
                  src={r.url}
                  playsInline
                  loop
                  muted
                  controls={false}
                  onClick={(e) => {
                    const v = e.currentTarget;
                    if (v.paused) v.play().catch(() => {});
                    else v.pause();
                  }}
                  className="size-full object-contain"
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pb-10">
                  <p className="text-sm font-semibold text-white">{p.title}</p>
                  <p className="mt-0.5 text-xs text-white/70">
                    {p.city ?? p.location ?? "Nigeria"} · {p.property_type}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {formatNaira(Number(p.price), p.listing_type)}
                  </p>
                  <Link
                    to="/property/$id"
                    params={{ id: p.id }}
                    className="pointer-events-auto mt-3 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-black"
                  >
                    View listing
                  </Link>
                </div>

                <div className="absolute bottom-28 right-3 flex flex-col items-center gap-5">
                  <button
                    type="button"
                    onClick={() => setLiked((s) => ({ ...s, [r.id]: !s[r.id] }))}
                    className="flex flex-col items-center gap-1 text-white"
                    aria-label="Like reel"
                  >
                    <Heart
                      className={`size-7 ${liked[r.id] ? "fill-red-500 text-red-500" : ""}`}
                    />
                    <span className="text-[10px]">Like</span>
                  </button>
                  <Link
                    to="/property/$id"
                    params={{ id: p.id }}
                    className="flex flex-col items-center gap-1 text-white"
                  >
                    <MessageSquare className="size-7" />
                    <span className="text-[10px]">Enquire</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      const url = `${window.location.origin}/property/${p.id}`;
                      if (navigator.share) navigator.share({ title: p.title, url });
                      else navigator.clipboard?.writeText(url);
                    }}
                    className="flex flex-col items-center gap-1 text-white"
                    aria-label="Share reel"
                  >
                    <Share2 className="size-7" />
                    <span className="text-[10px]">Share</span>
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
