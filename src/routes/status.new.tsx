import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, Sparkles, Clock } from "lucide-react";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { uploadMedia } from "@/lib/storage";

export const Route = createFileRoute("/status/new")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "New status — Dejedy" },
      { name: "description", content: "Share a time-limited status update to the Dejedy feed." },
    ],
  }),
  component: NewStatus,
});

type Duration = 24 | 48 | 168;

function NewStatus() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [duration, setDuration] = useState<Duration>(24);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("status_duration_hours")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const d = data?.status_duration_hours as Duration | undefined;
        if (d === 24 || d === 48 || d === 168) setDuration(d);
      });
  }, [user]);

  function pick(f: File | null) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return toast.error("Sign in first");
    if (!file) return toast.error("Choose an image");
    setSubmitting(true);
    try {
      const { url } = await uploadMedia(user.id, "status", file);
      const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000).toISOString();
      const { error } = await supabase.from("status_posts").insert({
        user_id: user.id,
        image_url: url,
        caption: caption.trim() || null,
        expires_at: expiresAt,
      });
      if (error) throw error;
      toast.success("Status posted");
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err.message ?? "Could not post");
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <Header />
        <main className="mx-auto max-w-xl px-4 py-10 text-sm text-muted-foreground">Loading…</main>
        <BottomNav />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <Header />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <h1 className="font-display text-2xl font-semibold text-foreground">Sign in to post a status</h1>
          <Link to="/auth" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground">
            Sign in
          </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  const durations: { label: string; hours: Duration }[] = [
    { label: "24 hours", hours: 24 },
    { label: "48 hours", hours: 48 },
    { label: "1 week", hours: 168 },
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />
      <main className="mx-auto max-w-xl px-4 py-6 md:py-10">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          <h1 className="font-display text-3xl font-semibold text-foreground">New status</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Post a time-limited update. It disappears when the timer runs out.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4 rounded-3xl bg-card p-6 ring-1 ring-border">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="grid w-full place-items-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted/60"
          >
            {preview ? (
              <img src={preview} alt="Preview" className="aspect-[4/5] w-full object-cover" />
            ) : (
              <div className="grid aspect-[4/5] w-full place-items-center gap-2 p-8 text-center">
                <Camera className="size-6 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Tap to add a photo</p>
                <p className="text-xs text-muted-foreground">JPG or PNG, up to ~10MB</p>
              </div>
            )}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0] ?? null)}
          />

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Caption</span>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Say something…"
              maxLength={140}
              className="w-full rounded-xl bg-muted px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </label>

          <div>
            <span className="mb-2 flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="size-3" /> Visible for
            </span>
            <div className="grid grid-cols-3 gap-2">
              {durations.map((d) => (
                <button
                  type="button"
                  key={d.hours}
                  onClick={() => setDuration(d.hours)}
                  className={`rounded-xl px-3 py-2 text-sm font-medium ring-1 transition ${
                    duration === d.hours
                      ? "bg-primary text-primary-foreground ring-primary"
                      : "bg-muted text-foreground ring-border hover:bg-accent"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Default lives in <Link to="/settings" className="underline">Settings → Status duration</Link>.
            </p>
          </div>

          <button
            disabled={submitting || !file}
            className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {submitting ? "Posting…" : "Post status"}
          </button>
        </form>
      </main>
      <BottomNav />
    </div>
  );
}
