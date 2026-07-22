import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatNaira } from "@/lib/mock-data";
import { Trash2, ShieldCheck, Users, Home, Radio, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Manager dashboard — Dejedy" },
      { name: "description", content: "Admin monitoring for Dejedy." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

type Profile = { id: string; full_name: string | null; created_at: string; avatar_url: string | null };
type Property = { id: string; title: string; price: number; listing_type: string; city: string | null; created_at: string; owner_id: string; image_url: string | null };
type Status = { id: string; user_id: string; caption: string | null; created_at: string; expires_at: string };

const ADMIN_PASSWORD = "DEJEDY123";
const ADMIN_UNLOCK_KEY = "dejedy_admin_unlocked";

function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [metric, setMetric] = useState<"listings" | "signups">("listings");
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(ADMIN_UNLOCK_KEY) === "1";
  });
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user, loading, navigate]);

  function submitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwInput === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_UNLOCK_KEY, "1");
      setUnlocked(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  }

  function lock() {
    sessionStorage.removeItem(ADMIN_UNLOCK_KEY);
    setUnlocked(false);
    setPwInput("");
  }

  useEffect(() => {
    if (!isAdmin || !unlocked) return;
    (async () => {
      const [{ data: p }, { data: pr }, { data: s }] = await Promise.all([
        supabase.from("profiles").select("id,full_name,created_at,avatar_url").order("created_at", { ascending: false }),
        supabase.from("properties").select("id,title,price,listing_type,city,created_at,owner_id,image_url").order("created_at", { ascending: false }),
        supabase.from("status_posts").select("id,user_id,caption,created_at,expires_at").order("created_at", { ascending: false }),
      ]);
      setProfiles(p ?? []);
      setProperties(pr ?? []);
      setStatuses(s ?? []);
    })();
  }, [isAdmin, unlocked]);

  const chartData = useMemo(() => {
    const source = metric === "listings" ? properties.map(p => p.created_at) : profiles.map(p => p.created_at);
    const today = startOfDay(new Date());
    const days = Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i));
    return days.map((d, i) => {
      const lastWeekDay = subDays(d, 7);
      const thisCount = source.filter(t => {
        const dt = startOfDay(new Date(t));
        return dt.getTime() === d.getTime();
      }).length;
      const lastCount = source.filter(t => {
        const dt = startOfDay(new Date(t));
        return dt.getTime() === lastWeekDay.getTime();
      }).length;
      return { label: format(d, "MMM d"), thisWeek: thisCount, lastWeek: lastCount, idx: i };
    });
  }, [metric, properties, profiles]);

  const activeStatuses = statuses.filter(s => new Date(s.expires_at) > new Date());
  const gmv = properties.reduce((sum, p) => sum + Number(p.price || 0), 0);

  async function deleteProperty(id: string) {
    if (!confirm("Delete this listing?")) return;
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setProperties(prev => prev.filter(p => p.id !== id));
    toast.success("Listing removed");
  }

  async function deleteStatus(id: string) {
    if (!confirm("Delete this status?")) return;
    const { error } = await supabase.from("status_posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setStatuses(prev => prev.filter(s => s.id !== id));
    toast.success("Status removed");
  }

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-navy-50">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-16 text-center text-sm text-navy-700">Loading…</main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-navy-50">
        <Header />
        <main className="mx-auto max-w-md px-4 py-16 text-center">
          <ShieldCheck className="mx-auto size-10 text-navy-700" />
          <h1 className="mt-4 font-display text-2xl font-semibold text-navy-950">Manager access only</h1>
          <p className="mt-2 text-sm text-navy-700">Your account doesn't have the admin role. Ask an existing admin to grant it.</p>
          <Link to="/" className="mt-6 inline-block rounded-full bg-navy-950 px-5 py-2 text-sm text-white">Back home</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50 pb-32 dark:bg-navy-950">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-navy-700">Manager dashboard</p>
            <h1 className="font-display text-3xl font-semibold text-navy-950 dark:text-white">Dejedy control room</h1>
          </div>
          <span className="hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 md:inline">Admin</span>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi icon={<Users className="size-4" />} label="Total users" value={profiles.length} />
          <Kpi icon={<Home className="size-4" />} label="Total listings" value={properties.length} />
          <Kpi icon={<Radio className="size-4" />} label="Active statuses" value={activeStatuses.length} />
          <Kpi icon={<TrendingUp className="size-4" />} label="Listing GMV" value={formatNaira(gmv, "Buy")} />
        </div>

        {/* Chart */}
        <div className="mt-6 rounded-3xl bg-white p-5 ring-1 ring-black/5 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-navy-950">
                {metric === "listings" ? "New listings" : "New signups"} <span className="text-sm text-navy-700">(current)</span>
              </h2>
              <p className="font-display text-3xl font-semibold text-navy-950">
                {chartData.reduce((s, d) => s + d.thisWeek, 0)}
              </p>
            </div>
            <div className="flex rounded-full bg-navy-50 p-1 text-xs font-medium">
              <button onClick={() => setMetric("listings")} className={`rounded-full px-3 py-1.5 ${metric === "listings" ? "bg-white text-navy-950 shadow-sm" : "text-navy-700"}`}>Listings</button>
              <button onClick={() => setMetric("signups")} className={`rounded-full px-3 py-1.5 ${metric === "signups" ? "bg-white text-navy-950 shadow-sm" : "text-navy-700"}`}>Signups</button>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="label" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)" }} />
                <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" name="This week" dataKey="thisWeek" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" name="Last week" dataKey="lastWeek" stroke="#2563eb" strokeWidth={2} strokeDasharray="5 5" dot={false} opacity={0.6} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel title={`Latest listings (${properties.length})`}>
            {properties.length === 0 ? <Empty text="No listings yet" /> : (
              <ul className="divide-y divide-black/5">
                {properties.slice(0, 10).map(p => (
                  <li key={p.id} className="flex items-center gap-3 py-3">
                    <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-navy-50">
                      {p.image_url && <img src={p.image_url} alt="" className="size-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link to="/property/$id" params={{ id: p.id }} className="line-clamp-1 text-sm font-medium text-navy-950 hover:underline">{p.title}</Link>
                      <p className="text-xs text-navy-700">{p.city ?? "—"} · {formatNaira(Number(p.price), p.listing_type)}</p>
                    </div>
                    <button onClick={() => deleteProperty(p.id)} className="rounded-full p-2 text-red-600 hover:bg-red-50" aria-label="Delete">
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={`Latest users (${profiles.length})`}>
            {profiles.length === 0 ? <Empty text="No users yet" /> : (
              <ul className="divide-y divide-black/5">
                {profiles.slice(0, 10).map(p => (
                  <li key={p.id} className="flex items-center gap-3 py-3">
                    <div className="grid size-10 place-items-center overflow-hidden rounded-full bg-navy-50 text-sm font-semibold text-navy-700">
                      {p.avatar_url ? <img src={p.avatar_url} alt="" className="size-full object-cover" /> : (p.full_name?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium text-navy-950">{p.full_name || "Unnamed"}</p>
                      <p className="text-xs text-navy-700">Joined {format(new Date(p.created_at), "MMM d, yyyy")}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={`Active statuses (${activeStatuses.length})`}>
            {activeStatuses.length === 0 ? <Empty text="No active statuses" /> : (
              <ul className="divide-y divide-black/5">
                {activeStatuses.slice(0, 10).map(s => (
                  <li key={s.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm text-navy-950">{s.caption || "(no caption)"}</p>
                      <p className="text-xs text-navy-700">Expires {format(new Date(s.expires_at), "MMM d, HH:mm")}</p>
                    </div>
                    <button onClick={() => deleteStatus(s.id)} className="rounded-full p-2 text-red-600 hover:bg-red-50" aria-label="Delete">
                      <Trash2 className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="How to grant admin">
            <p className="text-sm text-navy-700">
              Use the backend SQL runner to grant another user the admin role:
            </p>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-navy-950 p-3 text-xs text-white">
{`INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM auth.users
WHERE email = 'someone@example.com'
ON CONFLICT DO NOTHING;`}
            </pre>
          </Panel>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-black/5">
      <div className="flex items-center gap-2 text-xs font-medium text-navy-700">
        <span className="grid size-6 place-items-center rounded-full bg-navy-50">{icon}</span>
        {label}
      </div>
      <p className="mt-2 font-display text-2xl font-semibold text-navy-950">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white p-5 ring-1 ring-black/5">
      <h3 className="mb-2 font-display text-base font-semibold text-navy-950">{title}</h3>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-6 text-center text-sm text-navy-700">{text}</p>;
}
