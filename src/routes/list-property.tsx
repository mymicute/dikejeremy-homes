import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { Upload, Camera, MapPin, Sparkles } from "lucide-react";

export const Route = createFileRoute("/list-property")({
  head: () => ({
    meta: [
      { title: "List your property — DikeJeremy" },
      { name: "description", content: "Post your property to reach verified buyers and renters across Nigeria." },
    ],
  }),
  component: ListProperty,
});

function ListProperty() {
  return (
    <div className="min-h-screen bg-navy-50 pb-32">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-10">
        <h1 className="font-display text-4xl font-semibold text-navy-950">List your property</h1>
        <p className="mt-2 text-sm text-navy-700">
          Reach thousands of verified buyers and renters. Vendors are approved by our team before listings go live.
        </p>

        <form className="mt-8 space-y-4 rounded-3xl bg-white p-6 ring-1 ring-black/5" onSubmit={(e) => e.preventDefault()}>
          <Row label="Property title">
            <input placeholder="e.g. 3 Bedroom Apartment in Lekki" className="input" />
          </Row>
          <div className="grid gap-4 md:grid-cols-2">
            <Row label="Listing type">
              <select className="input"><option>Buy</option><option>Rent</option><option>Short Let</option></select>
            </Row>
            <Row label="Property type">
              <select className="input"><option>Apartment</option><option>Duplex</option><option>Terrace</option><option>Studio</option><option>Land</option></select>
            </Row>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Row label="Beds"><input type="number" defaultValue={3} className="input" /></Row>
            <Row label="Baths"><input type="number" defaultValue={3} className="input" /></Row>
            <Row label="Size (m²)"><input type="number" defaultValue={120} className="input" /></Row>
          </div>
          <Row label="Price (₦)"><input type="number" placeholder="50000000" className="input" /></Row>
          <Row label="Location">
            <div className="flex items-center gap-2 rounded-2xl bg-navy-50 px-4 py-3">
              <MapPin className="size-4 text-navy-700" />
              <input placeholder="Area, City, State" className="flex-1 bg-transparent text-sm outline-none" />
            </div>
          </Row>
          <Row label="Description"><textarea rows={4} className="input" placeholder="Describe the property, amenities and neighbourhood…" /></Row>
          <Row label="Photos">
            <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-navy-700/30 bg-navy-50 p-8 text-center">
              <Camera className="size-6 text-navy-700" />
              <p className="text-sm font-medium text-navy-950">Drop photos or click to upload</p>
              <p className="text-xs text-navy-700">Up to 20 images, JPG or PNG</p>
            </div>
          </Row>
          <div className="flex items-center gap-2 rounded-2xl bg-navy-950 p-4 text-white">
            <Sparkles className="size-4" />
            <p className="text-xs">Verified vendors get a badge, priority ranking and status posts.</p>
          </div>
          <button className="w-full rounded-full bg-navy-950 py-3 text-sm font-medium text-white">
            <Upload className="mr-2 inline size-4" /> Submit for review
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-navy-700">
          Not a vendor yet? <Link to="/auth" className="underline">Create your vendor account</Link>
        </p>
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
