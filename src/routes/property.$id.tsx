import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BadgeCheck, Bed, Bath, Ruler, MapPin, Heart, Share2, ArrowLeft, Flag, CreditCard } from "lucide-react";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { PropertyMap } from "@/components/site/PropertyMap";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/mock-data";
import type { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Property = Tables<"properties">;

export const Route = createFileRoute("/property/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Property — Dejedy" },
      { name: "description", content: "Property details on Dejedy." },
    ],
  }),
  component: PropertyDetail,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-navy-50 px-4 text-center">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-950">Property not found</h1>
        <Link to="/browse" className="mt-4 inline-block rounded-full bg-navy-950 px-5 py-2 text-sm text-white">
          Browse listings
        </Link>
      </div>
    </div>
  ),
});

function PropertyDetail() {
  const { id } = Route.useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("properties").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setProperty(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-50 pb-32">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-10 text-sm text-navy-700">Loading…</main>
        <BottomNav />
      </div>
    );
  }
  if (!property) throw notFound();

  function share() {
    const url = window.location.href;
    if (navigator.share) navigator.share({ url, title: property!.title }).catch(() => {});
    else {
      navigator.clipboard.writeText(url);
      toast.success("Link copied");
    }
  }

  return (
    <div className="min-h-screen bg-navy-50 pb-40">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
        <Link to="/browse" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy-700 hover:text-navy-950">
          <ArrowLeft className="size-4" /> Back to listings
        </Link>

        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-black/5">
          {property.image_url ? (
            <img src={property.image_url} alt={property.title} className="h-64 w-full object-cover md:h-[520px]" />
          ) : (
            <div className="grid h-64 place-items-center bg-navy-50 md:h-[520px]"><MapPin className="size-10 text-navy-700" /></div>
          )}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-navy-950 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
                {property.listing_type}
              </span>
              <span className="inline-flex items-center gap-1 text-sm text-navy-700">
                <MapPin className="size-3.5" /> {property.location || `${property.city ?? ""} ${property.state ?? ""}`}
              </span>
            </div>

            <h1 className="font-display text-3xl font-semibold text-navy-950 md:text-4xl">{property.title}</h1>
            <p className="mt-2 font-display text-3xl font-semibold text-navy-950">
              {formatNaira(Number(property.price), property.listing_type)}
            </p>

            <div className="mt-6 flex flex-wrap gap-6 rounded-2xl bg-white p-5 ring-1 ring-black/5">
              {property.beds != null && <Stat icon={<Bed className="size-4" />} label="Beds" value={String(property.beds)} />}
              {property.baths != null && <Stat icon={<Bath className="size-4" />} label="Baths" value={String(property.baths)} />}
              {property.size_sqm != null && <Stat icon={<Ruler className="size-4" />} label="Size" value={`${property.size_sqm}m²`} />}
            </div>

            {property.description && (
              <section className="mt-8">
                <h2 className="font-display text-xl font-semibold text-navy-950">Description</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-navy-700">{property.description}</p>
              </section>
            )}

            <section className="mt-8">
              <h2 className="mb-3 font-display text-xl font-semibold text-navy-950">Location</h2>
              {property.latitude && property.longitude ? (
                <PropertyMap
                  pins={[{ id: property.id, lat: property.latitude, lng: property.longitude, title: property.title, price: formatNaira(Number(property.price), property.listing_type) }]}
                  height={320}
                />
              ) : (
                <div className="grid h-40 place-items-center rounded-3xl bg-white text-sm text-navy-700 ring-1 ring-black/5">
                  Location not tagged
                </div>
              )}
            </section>

            <div className="mt-8 flex flex-wrap gap-2">
              <button onClick={() => setSaved((s) => !s)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ring-1 ring-black/10 ${saved ? "bg-navy-950 text-white" : "bg-white text-navy-950"}`}>
                <Heart className={`size-4 ${saved ? "fill-current" : ""}`} /> {saved ? "Saved" : "Save"}
              </button>
              <button onClick={share} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-navy-950 ring-1 ring-black/10">
                <Share2 className="size-4" /> Share
              </button>
              <button onClick={() => toast("Reported. Our team will review this listing.")} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-navy-950 ring-1 ring-black/10">
                <Flag className="size-4" /> Report
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
              <p className="mb-4 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                <BadgeCheck className="size-3.5" /> Secure payment via Dejedy
              </p>
              <p className="text-sm text-navy-700">
                All payments go through Dejedy — never pay the agent directly. Card or direct bank transfer to the Dejedy admin account.
              </p>
              <Link
                to="/checkout/$id"
                params={{ id: property.id }}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-navy-950 px-4 py-3 text-sm font-medium text-white"
              >
                <CreditCard className="size-4" /> Reserve / Pay
              </Link>
              <Link
                to="/messages"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-navy-50 px-4 py-3 text-sm font-medium text-navy-950"
              >
                Message about this listing
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-xs text-navy-700">{icon} {label}</div>
      <p className="font-display text-xl font-semibold text-navy-950">{value}</p>
    </div>
  );
}
