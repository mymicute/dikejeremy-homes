import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchPeers, formatTime, initials, type ChatPeer } from "@/lib/chat";
import type { Tables } from "@/integrations/supabase/types";
import { MessageCircle } from "lucide-react";

type Conversation = Tables<"conversations">;

export const Route = createFileRoute("/messages/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Messages — Dejedy" },
      { name: "description", content: "Chat directly with vendors and buyers about listings on Dejedy." },
      { property: "og:title", content: "Messages — Dejedy" },
      { property: "og:description", content: "Chat directly with vendors and buyers about listings on Dejedy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MessagesIndex,
});

function MessagesIndex() {
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Conversation[]>([]);
  const [peers, setPeers] = useState<Map<string, ChatPeer>>(new Map());
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .order("last_message_at", { ascending: false });
    const list = data ?? [];
    setRows(list);
    setPeers(await fetchPeers(list.map((c) => (c.buyer_id === user.id ? c.vendor_id : c.buyer_id))));

    const { data: unreadRows } = await supabase
      .from("messages")
      .select("conversation_id")
      .is("read_at", null)
      .neq("sender_id", user.id);
    const counts: Record<string, number> = {};
    for (const m of unreadRows ?? []) counts[m.conversation_id] = (counts[m.conversation_id] ?? 0) + 1;
    setUnread(counts);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) {
      if (!authLoading) setLoading(false);
      return;
    }
    void load();
    const channel = supabase
      .channel("conversations-list")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => void load())
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => void load())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, authLoading, load]);

  return (
    <div className="min-h-screen bg-navy-50 pb-32">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-10">
        <h1 className="mb-6 font-display text-3xl font-semibold text-navy-950">Messages</h1>

        {authLoading || loading ? (
          <p className="text-sm text-navy-700">Loading conversations…</p>
        ) : !user ? (
          <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-black/5">
            <p className="text-sm text-navy-700">Sign in to chat with vendors and buyers.</p>
            <Link to="/auth" className="mt-4 inline-block rounded-full bg-navy-950 px-5 py-2 text-sm text-white">
              Sign in
            </Link>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-black/5">
            <MessageCircle className="mx-auto mb-3 size-6 text-navy-700" />
            <p className="text-sm text-navy-700">
              No conversations yet. Open any listing and tap “Message about this listing”.
            </p>
            <Link to="/browse" className="mt-4 inline-block rounded-full bg-navy-950 px-5 py-2 text-sm text-white">
              Browse listings
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-black/5">
            {rows.map((c, i) => {
              const peerId = c.buyer_id === user.id ? c.vendor_id : c.buyer_id;
              const peer = peers.get(peerId);
              const count = unread[c.id] ?? 0;
              return (
                <Link
                  key={c.id}
                  to="/messages/$id"
                  params={{ id: c.id }}
                  className={`flex items-center gap-3 p-4 hover:bg-navy-50 ${i < rows.length - 1 ? "border-b border-black/5" : ""}`}
                >
                  {peer?.avatar_url ? (
                    <img src={peer.avatar_url} alt="" className="size-12 rounded-full object-cover" />
                  ) : (
                    <div className="grid size-12 place-items-center rounded-full bg-navy-950 font-display font-semibold text-white">
                      {initials(peer?.full_name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display font-semibold text-navy-950">
                      {peer?.full_name?.trim() || "Dejedy user"}
                    </p>
                    <p className="truncate text-xs text-navy-700">{c.last_message ?? "Say hello 👋"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-navy-700">{formatTime(c.last_message_at)}</span>
                    {count > 0 && (
                      <span className="grid min-w-5 place-items-center rounded-full bg-emerald-600 px-1.5 text-[10px] font-semibold text-white">
                        {count}
                      </span>
                    )}
                  </div>
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
