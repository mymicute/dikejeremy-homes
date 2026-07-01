import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { agents } from "@/lib/mock-data";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/messages/")({
  head: () => ({
    meta: [
      { title: "Messages — DikeJeremy" },
      { name: "description", content: "Chat with verified agents about properties you love." },
    ],
  }),
  component: MessagesIndex,
});

function MessagesIndex() {
  return (
    <div className="min-h-screen bg-navy-50 pb-32">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-10">
        <h1 className="mb-6 font-display text-3xl font-semibold text-navy-950">Messages</h1>
        <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-black/5">
          {agents.map((a, i) => (
            <Link
              key={a.id}
              to="/messages/$id"
              params={{ id: a.id }}
              className={`flex items-center gap-3 p-4 hover:bg-navy-50 ${i < agents.length - 1 ? "border-b border-black/5" : ""}`}
            >
              <div className="grid size-12 place-items-center rounded-full bg-navy-950 font-display font-semibold text-white">
                {a.avatarInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold text-navy-950">{a.name}</p>
                <p className="truncate text-xs text-navy-700">Tap to open the conversation</p>
              </div>
              <MessageCircle className="size-4 text-navy-700" />
            </Link>
          ))}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
