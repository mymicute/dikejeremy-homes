import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Plus, LogOut, Settings as SettingsIcon, Sparkles, Building2, Pencil, Trash2 } from "lucide-react";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { uploadMedia } from "@/lib/storage";
import { formatNaira } from "@/lib/mock-data";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/profile")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Your profile — Dejedy" },
      { name: "description", content: "Manage your Dejedy profile, listings and status updates." },
    ],
  }),
  component: ProfilePage,
});

type Profile = Tables<"profiles">;
type Property = Tables<"properties">;

function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: props }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("properties").select("*").eq("owner_id", user.id).order("created_at", { ascending: false }),
      ]);
      setProfile(p);
      setName(p?.full_name ?? "");
      setBio(p?.bio ?? "");
      setProperties(props ?? []);
      setLoading(false);
    })();
  }, [user, authLoading]);

  async function saveProfile() {
    if (!user) return;
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name.trim(), bio: bio.trim() })
      .eq("id", user.id);
    setSavingName(false);
    if (error) return toast.error(error.message);
    setProfile((p) => (p ? { ...p, full_name: name.trim(), bio: bio.trim() } : p));
    setEditing(false);
    toast.success("Profile updated");
  }

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const { url } = await uploadMedia(user.id, "avatar", file);
      const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
      if (error) throw error;
      setProfile((p) => (p ? { ...p, avatar_url: url } : p));
      toast.success("Avatar updated");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
    } finally {
      e.target.value = "";
    }
  }

  async function deleteProperty(id: string) {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setProperties((ps) => ps.filter((p) => p.id !== id));
    toast.success("Listing deleted");
  }

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">Loading…</main>
        <BottomNav />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <Header />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-muted">
            <SettingsIcon className="size-6 text-muted-foreground" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold text-foreground">Sign in to view your profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your listings, post status updates, and personalize your account.
          </p>
          <Link
            to="/auth"
            className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
          >
            Sign in
          </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  const initials = (profile?.full_name || user.email || "U")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-10">
        {/* Profile header */}
        <section className="rounded-3xl bg-card p-6 ring-1 ring-border md:p-8">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
            <div className="relative">
              <div className="grid size-24 place-items-center overflow-hidden rounded-full bg-primary text-2xl font-semibold text-primary-foreground ring-2 ring-border">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name ?? "Avatar"} className="size-full object-cover" />
                ) : (
                  <span className="font-display">{initials}</span>
                )}
              </div>
              <button
                onClick={() => avatarInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 grid size-8 place-items-center rounded-full bg-primary text-primary-foreground ring-2 ring-card"
                aria-label="Change avatar"
              >
                <Camera className="size-4" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickAvatar}
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              {editing ? (
                <div className="space-y-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full rounded-xl bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Short bio"
                    rows={2}
                    className="w-full rounded-xl bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex justify-center gap-2 md:justify-start">
                    <button
                      onClick={saveProfile}
                      disabled={savingName}
                      className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-60"
                    >
                      {savingName ? "Saving…" : "Save"}
                    </button>
                    <button onClick={() => setEditing(false)} className="rounded-full bg-muted px-4 py-1.5 text-xs font-medium text-foreground">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">
                    {profile?.full_name || "Add your name"}
                  </h1>
                  <p className="text-sm text-muted-foreground">{user.email ?? profile?.phone}</p>
                  {profile?.bio && <p className="mt-2 text-sm text-foreground">{profile.bio}</p>}
                  <button
                    onClick={() => setEditing(true)}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="size-3" /> Edit profile
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-4">
            <Link
              to="/list-property"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground"
            >
              <Plus className="size-4" /> New listing
            </Link>
            <Link
              to="/status/new"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-card px-4 py-2.5 text-xs font-medium text-foreground ring-1 ring-border hover:bg-accent"
            >
              <Sparkles className="size-4" /> Post status
            </Link>
            <Link
              to="/settings"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-card px-4 py-2.5 text-xs font-medium text-foreground ring-1 ring-border hover:bg-accent"
            >
              <SettingsIcon className="size-4" /> Settings
            </Link>
            <button
              onClick={signOut}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-card px-4 py-2.5 text-xs font-medium text-foreground ring-1 ring-border hover:bg-accent"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </section>

        {/* Listings */}
        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-foreground">Your listings</h2>
            <span className="text-xs text-muted-foreground">{properties.length} total</span>
          </div>

          {properties.length === 0 ? (
            <div className="rounded-3xl bg-card p-10 text-center ring-1 ring-border">
              <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-muted">
                <Building2 className="size-6 text-muted-foreground" />
              </div>
              <p className="mt-4 font-display text-lg font-semibold text-foreground">No listings yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Post your first property to reach buyers and renters.</p>
              <Link
                to="/list-property"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
              >
                <Plus className="size-4" /> Add a listing
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {properties.map((p) => (
                <article key={p.id} className="overflow-hidden rounded-3xl bg-card ring-1 ring-border">
                  <div className="aspect-[4/3] w-full bg-muted">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.title} className="size-full object-cover" />
                    ) : (
                      <div className="grid size-full place-items-center text-muted-foreground">
                        <Building2 className="size-8" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
                      <span>{p.city ?? p.location ?? "—"}</span>
                      <span>{p.listing_type}</span>
                    </div>
                    <h3 className="mt-1 font-display text-lg font-semibold text-foreground">
                      {formatNaira(Number(p.price), p.listing_type)}
                    </h3>
                    <p className="line-clamp-1 text-sm text-muted-foreground">{p.title}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {p.beds ?? 0} bed · {p.baths ?? 0} bath · {p.size_sqm ?? 0}m²
                      </span>
                      <button
                        onClick={() => deleteProperty(p.id)}
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-foreground hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="size-3" /> Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <BottomNav />
    </div>
  );
}
