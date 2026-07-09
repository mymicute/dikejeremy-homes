import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BadgeCheck, Phone, MessageCircle, MapPin, Star, Users } from "lucide-react";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { PropertyCard } from "@/components/site/PropertyCard";
import { getAgent, properties } from "@/lib/mock-data";

export const Route = createFileRoute("/agents/$id")({
  loader: ({ params }) => {
    const agent = getAgent(params.id);
    if (!agent) throw notFound();
    return { agent };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.agent;
    if (!a) return { meta: [{ title: "Agent — Dejedy" }] };
    return {
      meta: [
        { title: `${a.name} — ${a.role} in ${a.city} · Dejedy` },
        { name: "description", content: a.bio },
        { property: "og:title", content: `${a.name} — Dejedy` },
        { property: "og:description", content: a.bio },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-navy-50">
      <p>Agent not found. <Link to="/agents" className="underline">Back</Link></p>
    </div>
  ),
  component: AgentDetail,
});

function AgentDetail() {
  const { agent } = Route.useLoaderData();
  const listings = properties.filter((p) => p.agentId === agent.id);

  return (
    <div className="min-h-screen bg-navy-50 pb-32">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
        <div className="rounded-3xl bg-white p-6 ring-1 ring-black/5 md:p-8">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            <div className="grid size-24 place-items-center rounded-full bg-navy-950 font-display text-2xl font-semibold text-white">
              {agent.avatarInitials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl font-semibold text-navy-950">{agent.name}</h1>
                {agent.verified && <BadgeCheck className="size-5 text-emerald-600" />}
              </div>
              <p className="mt-1 text-sm text-navy-700">
                {agent.role}{agent.company ? ` · ${agent.company}` : ""}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-navy-700">
                <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {agent.city}</span>
                <span className="inline-flex items-center gap-1"><Star className="size-3.5 fill-current text-yellow-500" /> {agent.rating} ({agent.reviews})</span>
                <span className="inline-flex items-center gap-1"><Users className="size-3.5" /> {agent.followers.toLocaleString()} followers</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/messages/$id"
                params={{ id: agent.id }}
                className="inline-flex items-center gap-2 rounded-full bg-navy-950 px-5 py-2.5 text-sm font-medium text-white"
              >
                <MessageCircle className="size-4" /> Message
              </Link>
              <a
                href={`tel:${agent.phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-navy-950 ring-1 ring-black/10"
              >
                <Phone className="size-4" /> Call
              </a>
            </div>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-navy-700">{agent.bio}</p>
        </div>

        <section className="mt-10">
          <h2 className="mb-4 font-display text-2xl font-semibold text-navy-950">
            {listings.length} active listing{listings.length === 1 ? "" : "s"}
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
