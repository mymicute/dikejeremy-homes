import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Star, MapPin } from "lucide-react";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { agents } from "@/lib/mock-data";

export const Route = createFileRoute("/agents/")({
  head: () => ({
    meta: [
      { title: "Verified Agents — DikeJeremy" },
      { name: "description", content: "Browse verified estate agents, landlords and developers across Nigeria." },
      { property: "og:title", content: "Verified Agents — DikeJeremy" },
      { property: "og:description", content: "Trusted vendors across Lagos, Abuja and Port Harcourt." },
    ],
  }),
  component: AgentsIndex,
});

function AgentsIndex() {
  return (
    <div className="min-h-screen bg-navy-50 pb-32">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
        <h1 className="font-display text-3xl font-semibold text-navy-950 md:text-4xl">
          Verified vendors
        </h1>
        <p className="mt-2 text-sm text-navy-700">
          Estate agents, landlords, developers and real estate companies — all vetted.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((a) => (
            <Link
              key={a.id}
              to="/agents/$id"
              params={{ id: a.id }}
              className="rounded-3xl bg-white p-5 ring-1 ring-black/5 transition hover:ring-navy-700/40"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-14 place-items-center rounded-full bg-navy-950 font-display font-semibold text-white">
                  {a.avatarInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-display font-semibold text-navy-950">{a.name}</p>
                    {a.verified && <BadgeCheck className="size-4 text-emerald-600" />}
                  </div>
                  <p className="text-xs text-navy-700">{a.role} · {a.company ?? "Independent"}</p>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-xs text-navy-700">{a.bio}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-navy-700">
                <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {a.city}</span>
                <span className="inline-flex items-center gap-1"><Star className="size-3.5 fill-current text-yellow-500" /> {a.rating} · {a.listings} listings</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
