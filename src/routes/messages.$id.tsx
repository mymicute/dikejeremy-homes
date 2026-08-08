import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchPeers, formatTime, initials, type ChatPeer } from "@/lib/chat";
import { formatNaira } from "@/lib/mock-data";
import type { Tables } from "@/integrations/supabase/types";
import { ArrowLeft, Send, Check, CheckCheck } from "lucide-react";
import { toast } from "sonner";

type Message = Tables<"messages">;
type Conversation = Tables<"conversations">;
type Property = Pick<Tables<"properties">, "id" | "title" | "price" | "image_url">;

export const Route = createFileRoute("/messages/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Chat — Dejedy" },
      { name: "description", content: "Your conversation on Dejedy." },
      { property: "og:title", content: "Chat — Dejedy" },
      { property: "og:description", content: "Your conversation on Dejedy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Chat,
});

function Chat() {
  const { id } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [peer, setPeer] = useState<ChatPeer | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement | null>(null);

  const markRead = useCallback(
    async (userId: string) => {
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", id)
        .neq("sender_id", userId)
        .is("read_at", null);
    },
    [id],
  );

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    let active = true;

    (async () => {
      const { data: conv } = await supabase.from("conversations").select("*").eq("id", id).maybeSingle();
      if (!active) return;
      if (!conv) {
        setLoading(false);
        return;
      }
      setConversation(conv);

      const peerId = conv.buyer_id === user.id ? conv.vendor_id : conv.buyer_id;
      const peers = await fetchPeers([peerId]);
      if (!active) return;
      setPeer(peers.get(peerId) ?? null);

      if (conv.property_id) {
        const { data: prop } = await supabase
          .from("properties")
          .select("id, title, price, image_url")
          .eq("id", conv.property_id)
          .maybeSingle();
        if (active) setProperty(prop);
      }

      const { data: rows } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });
      if (!active) return;
      setMsgs(rows ?? []);
      setLoading(false);
      void markRead(user.id);
    })();

    const channel = supabase
      .channel(`chat-${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        (payload) => {
          const m = payload.new as Message;
          setMsgs((prev) => (prev.some((p) => p.id === m.id) ? prev : [...prev, m]));
          if (m.sender_id !== user.id) void markRead(user.id);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `conversation_id=eq.${id}` },
        (payload) => {
          const m = payload.new as Message;
          setMsgs((prev) => prev.map((p) => (p.id === m.id ? m : p)));
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [id, user, authLoading, markRead]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  async function send() {
    const body = text.trim();
    if (!body || !user || sending) return;
    setSending(true);
    setText("");
    const { error } = await supabase.from("messages").insert({
      conversation_id: id,
      sender_id: user.id,
      body,
    });
    setSending(false);
    if (error) {
      setText(body);
      toast.error("Message not sent. Please try again.");
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-navy-50">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-navy-700">Loading conversation…</main>
        <BottomNav />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-navy-50">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-10 text-center">
          <p className="text-sm text-navy-700">Sign in to view this conversation.</p>
          <Link to="/auth" className="mt-4 inline-block rounded-full bg-navy-950 px-5 py-2 text-sm text-white">
            Sign in
          </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-navy-50">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-10 text-center">
          <p className="text-sm text-navy-700">This conversation is not available.</p>
          <button
            onClick={() => navigate({ to: "/messages" })}
            className="mt-4 rounded-full bg-navy-950 px-5 py-2 text-sm text-white"
          >
            Back to messages
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-navy-50 pb-28">
      <Header />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-4 md:px-6">
        <div className="mb-3 flex items-center gap-3 rounded-3xl bg-white p-4 ring-1 ring-black/5">
          <Link to="/messages" className="text-navy-700" aria-label="Back to messages">
            <ArrowLeft className="size-4" />
          </Link>
          {peer?.avatar_url ? (
            <img src={peer.avatar_url} alt="" className="size-10 rounded-full object-cover" />
          ) : (
            <div className="grid size-10 place-items-center rounded-full bg-navy-950 font-display text-sm font-semibold text-white">
              {initials(peer?.full_name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-display font-semibold text-navy-950">
              {peer?.full_name?.trim() || "Dejedy user"}
            </p>
            <p className="text-[11px] text-navy-700">
              {conversation.vendor_id === user.id ? "Buyer / renter" : "Vendor"}
            </p>
          </div>
        </div>

        {property && (
          <Link
            to="/property/$id"
            params={{ id: property.id }}
            className="mb-3 flex items-center gap-3 rounded-3xl bg-white p-3 ring-1 ring-black/5"
          >
            {property.image_url && (
              <img src={property.image_url} alt="" className="size-12 rounded-2xl object-cover" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-navy-950">{property.title}</p>
              <p className="text-xs text-navy-700">{formatNaira(Number(property.price))}</p>
            </div>
          </Link>
        )}

        <div className="flex-1 space-y-3 overflow-y-auto rounded-3xl bg-white p-4 ring-1 ring-black/5">
          {msgs.length === 0 && (
            <p className="py-8 text-center text-xs text-navy-700">
              No messages yet — send the first one.
            </p>
          )}
          {msgs.map((m) => {
            const mine = m.sender_id === user.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-navy-950 text-white" : "bg-navy-50 text-navy-950"}`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.body}</p>
                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? "text-white/60" : "text-navy-700"}`}
                  >
                    <span>{formatTime(m.created_at)}</span>
                    {mine &&
                      (m.read_at ? (
                        <CheckCheck className="size-3 text-sky-300" />
                      ) : (
                        <Check className="size-3" />
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-full bg-white p-2 ring-1 ring-black/5">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            placeholder="Type a message"
            className="flex-1 bg-transparent px-3 text-sm outline-none"
          />
          <button
            onClick={() => void send()}
            disabled={!text.trim() || sending}
            aria-label="Send message"
            className="rounded-full bg-navy-950 p-2.5 text-white disabled:opacity-40"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
