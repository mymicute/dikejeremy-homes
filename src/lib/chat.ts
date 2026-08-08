import { supabase } from "@/integrations/supabase/client";

export type ChatPeer = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

export function initials(name: string | null | undefined) {
  const n = (name ?? "").trim();
  if (!n) return "DJ";
  return n
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const diff = (now.getTime() - d.getTime()) / 86400000;
  if (diff < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { day: "2-digit", month: "short" });
}

/** Finds an existing conversation between the current user and the vendor, or creates one. */
export async function startConversation(vendorId: string, propertyId?: string | null) {
  const { data: userData } = await supabase.auth.getUser();
  const me = userData.user;
  if (!me) throw new Error("You need to sign in to send a message.");
  if (me.id === vendorId) throw new Error("This is your own listing.");

  let query = supabase
    .from("conversations")
    .select("id")
    .eq("buyer_id", me.id)
    .eq("vendor_id", vendorId);
  query = propertyId ? query.eq("property_id", propertyId) : query.is("property_id", null);

  const { data: existing } = await query.maybeSingle();
  if (existing) return existing.id;

  const { data, error } = await supabase
    .from("conversations")
    .insert({ buyer_id: me.id, vendor_id: vendorId, property_id: propertyId ?? null })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function fetchPeers(ids: string[]) {
  const unique = [...new Set(ids)].filter(Boolean);
  if (unique.length === 0) return new Map<string, ChatPeer>();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", unique);
  return new Map((data ?? []).map((p) => [p.id, p as ChatPeer]));
}
