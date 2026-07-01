import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  BadgeCheck, Bed, Bath, Ruler, MapPin, Phone, MessageCircle,
  Heart, Share2, Calendar, ArrowLeft, Flag,
} from "lucide-react";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { getProperty, getAgent, formatNaira, properties } from "@/lib/mock-data";

export const Route = createFileRoute("/property/$id")({
  loader: ({ params }) => {
    const property = getProperty(params.id);
    if (!property) throw notFound();
    return { property };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.property;
    if (!p) return { meta: [{ title: "Property — DikeJeremy" }] };
    const title = `${p.title} in ${p.area}, ${p.city} — DikeJeremy`;
    const desc = `${p.beds} bed · ${p.baths} bath · ${p.sizeSqm}m². ${formatNaira(p.price, p.listingType)} in ${p.area}.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:image", content: p.images[0] },
        { name: "twitter:image", content: p.images[0] },
      ],
    };
  },
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
  component: PropertyDetail,
});

function PropertyDetail() {
  const { property } = Route.useLoaderData();
  const agent = getAgent(property.agentId);
  const [saved, setSaved] = useState(false);
  const [gallery, setGallery] = useState(0);
  const similar = properties.filter(p => p.id !== property.id && p.city === property.city).slice(0, 3);

  return (
    <div className="min-h-screen bg-navy-50 pb-40">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
        <Link to="/browse" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy-700 hover:text-navy-950">
          <ArrowLeft className="size-4" /> Back to listings
        </Link>

        {/* Gallery */}
        <div className="grid gap-3 md:grid-cols-4 md:grid-rows-2">
          <div className="overflow-hidden rounded-3xl md:col-span-3 md:row-span-2">
            <img
              src={property.images[gallery]}
              alt={property.title}
              className="h-64 w-full object-cover md:h-[520px]"
            />
          </div>
          {property.images.slice(0, 4).map((src: string, i: number) => (
            <button
              key={i}
              onClick={() => setGallery(i)}
              className={`hidden overflow-hidden rounded-2xl ring-2 md:block ${i === gallery ? "ring-navy-950" : "ring-transparent"}`}
            >
              <img src={src} loading="lazy" alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Left: details */}
          <div className="lg:col-span-2">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {property.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <BadgeCheck className="size-3.5" /> VERIFIED
                </span>
              )}
              <span className="rounded-full bg-navy-950 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-white">
                {property.listingType}
              </span>
              <span className="inline-flex items-center gap-1 text-sm text-navy-700">
                <MapPin className="size-3.5" /> {property.area}, {property.city}, {property.state}
              </span>
            </div>

            <h1 className="font-display text-3xl font-semibold text-navy-950 md:text-4xl">
              {property.title}
            </h1>
            <p className="mt-2 font-display text-3xl font-semibold text-navy-950">
              {formatNaira(property.price, property.listingType)}
            </p>

            <div className="mt-6 flex flex-wrap gap-6 rounded-2xl bg-white p-5 ring-1 ring-black/5">
              {property.beds > 0 && (
                <Stat icon={<Bed className="size-4" />} label="Beds" value={String(property.beds)} />
              )}
              {property.baths > 0 && (
                <Stat icon={<Bath className="size-4" />} label="Baths" value={String(property.baths)} />
              )}
              <Stat icon={<Ruler className="size-4" />} label="Size" value={`${property.sizeSqm}m²`} />
              {property.toilets > 0 && (
                <Stat icon={<Bath className="size-4" />} label="Toilets" value={String(property.toilets)} />
              )}
            </div>

            <section className="mt-8">
              <h2 className="font-display text-xl font-semibold text-navy-950">Description</h2>
              <p className="mt-3 text-sm leading-relaxed text-navy-700">{property.description}</p>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-xl font-semibold text-navy-950">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {property.amenities.map((a: string) => (
                  <span key={a} className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-navy-950 ring-1 ring-black/5">
                    {a}
                  </span>
                ))}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="font-display text-xl font-semibold text-navy-950">Location</h2>
              <div className="mt-3 grid h-64 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br from-navy-700/20 to-navy-950/40 ring-1 ring-black/5">
                <div className="text-center">
                  <MapPin className="mx-auto size-8 text-navy-950" />
                  <p className="mt-2 text-sm font-medium text-navy-950">{property.area}, {property.city}</p>
                  <p className="text-xs text-navy-700">Interactive map coming soon</p>
                </div>
              </div>
            </section>

            <div className="mt-8 flex flex-wrap gap-2">
              <button
                onClick={() => setSaved(s => !s)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ring-1 ring-black/10 ${saved ? "bg-navy-950 text-white" : "bg-white text-navy-950"}`}
              >
                <Heart className={`size-4 ${saved ? "fill-current" : ""}`} /> {saved ? "Saved" : "Save"}
              </button>
              <button className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-navy-950 ring-1 ring-black/10">
                <Share2 className="size-4" /> Share
              </button>
              <button className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-navy-950 ring-1 ring-black/10">
                <Flag className="size-4" /> Report
              </button>
            </div>
          </div>

          {/* Right: agent + CTA */}
          <aside className="space-y-4">
            {agent && (
              <div className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-navy-700">Listed by</p>
                <Link to="/agents/$id" params={{ id: agent.id }} className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-full bg-navy-950 font-display font-semibold text-white">
                    {agent.avatarInitials}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-display font-semibold text-navy-950">{agent.name}</p>
                      {agent.verified && <BadgeCheck className="size-4 text-emerald-600" />}
                    </div>
                    <p className="text-xs text-navy-700">{agent.role} · ⭐ {agent.rating}</p>
                  </div>
                </Link>

                <div className="mt-5 space-y-2">
                  <Link
                    to="/messages/$id"
                    params={{ id: agent.id }}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-navy-950 px-4 py-3 text-sm font-medium text-white"
                  >
                    <MessageCircle className="size-4" /> Message
                  </Link>
                  <a
                    href={`tel:${agent.phone.replace(/\s/g, "")}`}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-medium text-navy-950 ring-1 ring-black/10"
                  >
                    <Phone className="size-4" /> Call
                  </a>
                  <a
                    href={`https://wa.me/${agent.whatsapp.replace(/[^\d]/g, "")}`}
                    target="_blank" rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-medium text-white"
                  >
                    WhatsApp
                  </a>
                  <button className="flex w-full items-center justify-center gap-2 rounded-full bg-navy-50 px-4 py-3 text-sm font-medium text-navy-950">
                    <Calendar className="size-4" /> Book Inspection
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-3xl bg-navy-950 p-6 text-white">
              <p className="text-[10px] font-semibold uppercase tracking-wider opacity-60">Verified Listing</p>
              <p className="mt-2 text-sm">
                This property was inspected and verified by the DikeJeremy on-ground team.
              </p>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-4 font-display text-2xl font-semibold text-navy-950">
              More in {property.city}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p) => (
                <Link key={p.id} to="/property/$id" params={{ id: p.id }} className="block">
                  <div className="overflow-hidden rounded-3xl bg-white p-3 ring-1 ring-black/5">
                    <img src={p.images[0]} loading="lazy" alt={p.title} className="mb-3 aspect-video w-full rounded-2xl object-cover" />
                    <h3 className="font-display font-semibold text-navy-950">{formatNaira(p.price, p.listingType)}</h3>
                    <p className="text-xs text-navy-700">{p.title} · {p.area}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
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
