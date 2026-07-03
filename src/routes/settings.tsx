import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Moon, Sun, Bell, Globe, ShieldCheck, Clock } from "lucide-react";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — DikeJeremy" },
      { name: "description", content: "Manage your DikeJeremy preferences, appearance and status duration." },
    ],
  }),
  component: Settings,
});

type Duration = 24 | 48 | 168;
const DURATIONS: { label: string; hours: Duration }[] = [
  { label: "24 hours", hours: 24 },
  { label: "48 hours", hours: 48 },
  { label: "1 week", hours: 168 },
];

function Settings() {
  const { user } = useAuth();
  const [dark, setDark] = useState(false);
  const [duration, setDuration] = useState<Duration>(24);
  const [savingDuration, setSavingDuration] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("dj-theme");
    const isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

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

  const toggle = (v: boolean) => {
    setDark(v);
    document.documentElement.classList.toggle("dark", v);
    localStorage.setItem("dj-theme", v ? "dark" : "light");
  };

  async function saveDuration(d: Duration) {
    setDuration(d);
    if (!user) return;
    setSavingDuration(true);
    const { error } = await supabase
      .from("profiles")
      .update({ status_duration_hours: d })
      .eq("id", user.id);
    setSavingDuration(false);
    if (error) toast.error(error.message);
    else toast.success("Status duration updated");
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-10">
        <h1 className="font-display text-3xl font-semibold text-foreground md:text-4xl">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Personalize your DikeJeremy experience.</p>

        <section className="mt-8 space-y-3">
          <Group title="Appearance">
            <Row
              icon={dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
              title="Dark mode"
              description="Use a darker palette across the app."
            >
              <Switch checked={dark} onCheckedChange={toggle} aria-label="Toggle dark mode" />
            </Row>
          </Group>

          <Group title="Status">
            <div className="px-5 py-4">
              <div className="flex items-start gap-4">
                <div className="grid size-9 place-items-center rounded-xl bg-muted text-foreground">
                  <Clock className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-semibold text-foreground">Status duration</p>
                  <p className="text-xs text-muted-foreground">
                    How long your status posts stay visible before they disappear.
                  </p>
                  {!user && (
                    <p className="mt-1 text-[11px] text-muted-foreground">Sign in to save this preference.</p>
                  )}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {DURATIONS.map((d) => (
                      <button
                        key={d.hours}
                        onClick={() => saveDuration(d.hours)}
                        disabled={savingDuration}
                        className={`rounded-xl px-3 py-2 text-xs font-medium ring-1 transition ${
                          duration === d.hours
                            ? "bg-primary text-primary-foreground ring-primary"
                            : "bg-muted text-foreground ring-border hover:bg-accent"
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Group>

          <Group title="Preferences">
            <Row icon={<Bell className="size-4" />} title="Notifications" description="Price drops, new messages and booking updates.">
              <Switch defaultChecked aria-label="Toggle notifications" />
            </Row>
            <Row icon={<Globe className="size-4" />} title="Region" description="Nigeria (₦ NGN)">
              <span className="text-xs font-medium text-muted-foreground">NG</span>
            </Row>
            <Row icon={<ShieldCheck className="size-4" />} title="Verified only" description="Show only verified listings and vendors.">
              <Switch aria-label="Toggle verified only" />
            </Row>
          </Group>
        </section>
      </main>
      <BottomNav />
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-border">
      <div className="border-b border-border px-5 py-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function Row({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="grid size-9 place-items-center rounded-xl bg-muted text-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="font-display font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
