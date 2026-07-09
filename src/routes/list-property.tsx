import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Camera, Sparkles } from "lucide-react";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { LocationPicker } from "@/components/site/LocationPicker";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { uploadMedia } from "@/lib/storage";

export const Route = createFileRoute("/list-property")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "List your property — Dejedy" },
      { name: "description", content: "Post your property to reach verified buyers and renters across Nigeria." },
    ],
  }),
  component: ListProperty,
});

function ListProperty() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    listing_type: "Buy",
    property_type: "Apartment",
    beds: 3,
    baths: 3,
    size_sqm: 120,
    price: 0,
    location: "",
    latitude: null as number | null,
    longitude: null as number | null,
    description: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function pickFile(f: File | null) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("Sign in to list a property");
      return navigate({ to: "/auth" });
    }
    if (!form.title.trim()) return toast.error("Enter a title");
    if (form.latitude == null || form.longitude == null) {
      return toast.error("Tag the property on the map");
    }
    setSubmitting(true);
    try {
      let image_url: string | null = null;
      if (file) {
        const up = await uploadMedia(user.id, "property", file);
        image_url = up.url;
      }
      const [city, state] = form.location.split(",").map((s) => s.trim());
      const { error } = await supabase.from("properties").insert({
        owner_id: user.id,
        title: form.title.trim(),
        description: form.description.trim() || null,
        property_type: form.property_type,
        listing_type: form.listing_type,
        price: Number(form.price) || 0,
        beds: Number(form.beds) || null,
        baths: Number(form.baths) || null,
        size_sqm: Number(form.size_sqm) || null,
        location: form.location.trim() || null,
        city: city || null,
        state: state || null,
        latitude: form.latitude,
        longitude: form.longitude,
        image_url,
      });
      if (error) throw error;
      toast.success("Listing posted");
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err.message ?? "Could not save");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-navy-50 pb-32">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-10 text-sm text-navy-700">Loading…</main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50 pb-32">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-10">
        <h1 className="font-display text-4xl font-semibold text-navy-950">List your property</h1>
        <p className="mt-2 text-sm text-navy-700">
          Reach thousands of buyers and renters. Your listing appears instantly in the feed.
        </p>

        {!user && (
          <div className="mt-4 rounded-2xl bg-white p-4 text-sm ring-1 ring-black/5">
            You need to be signed in.{" "}
            <Link to="/auth" className="font-medium underline">Sign in</Link>.
          </div>
        )}

        <form className="mt-8 space-y-4 rounded-3xl bg-white p-6 ring-1 ring-black/5" onSubmit={submit}>
          <Row label="Property title">
            <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. 3 Bedroom Apartment in Lekki" className="input" required />
          </Row>
          <div className="grid gap-4 md:grid-cols-2">
            <Row label="Listing type">
              <select value={form.listing_type} onChange={(e) => set("listing_type", e.target.value)} className="input">
                <option>Buy</option><option>Rent</option><option>Short Let</option>
              </select>
            </Row>
            <Row label="Property type">
              <select value={form.property_type} onChange={(e) => set("property_type", e.target.value)} className="input">
                <option>Apartment</option><option>Duplex</option><option>Terrace</option><option>Studio</option><option>Land</option>
              </select>
            </Row>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Row label="Beds"><input type="number" value={form.beds} onChange={(e) => set("beds", Number(e.target.value))} className="input" /></Row>
            <Row label="Baths"><input type="number" value={form.baths} onChange={(e) => set("baths", Number(e.target.value))} className="input" /></Row>
            <Row label="Size (m²)"><input type="number" value={form.size_sqm} onChange={(e) => set("size_sqm", Number(e.target.value))} className="input" /></Row>
          </div>
          <Row label="Price (₦)">
            <input type="number" value={form.price || ""} onChange={(e) => set("price", Number(e.target.value))} placeholder="50000000" className="input" />
          </Row>
          <Row label="Location on map">
            <LocationPicker
              lat={form.latitude}
              lng={form.longitude}
              address={form.location}
              onChange={(v) =>
                setForm((f) => ({
                  ...f,
                  latitude: v.lat,
                  longitude: v.lng,
                  location: v.address ?? f.location,
                }))
              }
            />
          </Row>
          <Row label="Description">
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className="input" placeholder="Describe the property, amenities and neighbourhood…" />
          </Row>
          <Row label="Photo">
            <button type="button" onClick={() => fileRef.current?.click()} className="grid w-full place-items-center gap-2 rounded-2xl border border-dashed border-navy-700/30 bg-navy-50 p-8 text-center">
              {preview ? (
                <img src={preview} alt="Preview" className="mx-auto max-h-64 rounded-xl object-cover" />
              ) : (
                <>
                  <Camera className="size-6 text-navy-700" />
                  <p className="text-sm font-medium text-navy-950">Tap to upload a photo</p>
                  <p className="text-xs text-navy-700">JPG or PNG</p>
                </>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
          </Row>
          <div className="flex items-center gap-2 rounded-2xl bg-navy-950 p-4 text-white">
            <Sparkles className="size-4" />
            <p className="text-xs">Verified vendors get a badge, priority ranking and status posts.</p>
          </div>
          <button disabled={submitting || !user} className="w-full rounded-full bg-navy-950 py-3 text-sm font-medium text-white disabled:opacity-60">
            <Upload className="mr-2 inline size-4" /> {submitting ? "Posting…" : "Publish listing"}
          </button>
        </form>
      </main>

      <style>{`.input{width:100%;background:var(--color-navy-50);padding:.75rem 1rem;border-radius:1rem;font-size:.875rem;outline:none}.input:focus{box-shadow:0 0 0 2px var(--color-navy-700)}`}</style>
      <BottomNav />
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-navy-700">{label}</span>
      {children}
    </label>
  );
}
