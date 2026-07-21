import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Copy, ArrowLeft, ShieldCheck, Loader2, CheckCircle2, Clock, RefreshCw, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/mock-data";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/checkout/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Secure checkout — Dejedy" },
      { name: "description", content: "Pay via a dedicated virtual account generated in your name." },
    ],
  }),
  component: Checkout,
});

type Status = "generating" | "waiting" | "paid" | "expired";

function Checkout() {
  const { id } = Route.useParams();
  const [property, setProperty] = useState<Tables<"properties"> | null>(null);
  const [buyerName, setBuyerName] = useState("");
  const [status, setStatus] = useState<Status>("generating");
  const [expiresIn, setExpiresIn] = useState(30 * 60); // 30 min countdown

  // Placeholder virtual-account payload — the provider will populate these once wired.
  const virtualAccount = useMemo(
    () => ({
      bank: "Wema Bank",
      accountName: buyerName ? `DEJEDY / ${buyerName.toUpperCase()}` : "DEJEDY / —",
      accountNumber: "—— generating ——",
      reference: id.slice(0, 8).toUpperCase(),
    }),
    [buyerName, id],
  );

  useEffect(() => {
    supabase.from("properties").select("*").eq("id", id).maybeSingle().then(({ data }) => setProperty(data));
    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id;
      if (!uid) return;
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", uid).maybeSingle();
      setBuyerName(profile?.full_name || data.user?.email?.split("@")[0] || "Customer");
    });
  }, [id]);

  // Fake "generating" → "waiting" transition so the UI feels real. Provider hook will replace this.
  useEffect(() => {
    if (status !== "generating") return;
    const t = setTimeout(() => setStatus("waiting"), 1400);
    return () => clearTimeout(t);
  }, [status]);

  // Countdown while waiting
  useEffect(() => {
    if (status !== "waiting") return;
    const t = setInterval(() => {
      setExpiresIn((s) => {
        if (s <= 1) {
          setStatus("expired");
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [status]);

  function copy(value: string, label: string) {
    if (value.includes("—")) return;
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  }

  function regenerate() {
    setExpiresIn(30 * 60);
    setStatus("generating");
  }

  const mm = String(Math.floor(expiresIn / 60)).padStart(2, "0");
  const ss = String(expiresIn % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-navy-50 pb-32">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6 md:px-6 md:py-10">
        <Link to="/property/$id" params={{ id }} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy-700 hover:text-navy-950">
          <ArrowLeft className="size-4" /> Back to listing
        </Link>

        <div className="rounded-3xl bg-white p-6 ring-1 ring-black/5 md:p-8">
          <div className="mb-6 flex items-center gap-2 text-emerald-700">
            <ShieldCheck className="size-4" />
            <p className="text-xs font-semibold uppercase tracking-wider">
              Paid to a Dejedy virtual account — never directly to the agent
            </p>
          </div>

          <h1 className="font-display text-3xl font-semibold text-navy-950">Bank transfer checkout</h1>
          {property && (
            <p className="mt-1 text-sm text-navy-700">
              {property.title} ·{" "}
              <span className="font-semibold text-navy-950">
                {formatNaira(Number(property.price), property.listing_type)}
              </span>
            </p>
          )}

          {/* Status banner */}
          <div className="mt-6">
            {status === "generating" && (
              <div className="flex items-center gap-3 rounded-2xl bg-navy-50 px-4 py-3 text-sm text-navy-950">
                <Loader2 className="size-4 animate-spin text-navy-700" />
                Generating a virtual account in your name…
              </div>
            )}
            {status === "waiting" && (
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
                <div className="flex items-center gap-2">
                  <Clock className="size-4" />
                  Waiting for your transfer…
                </div>
                <span className="font-display font-semibold tabular-nums">{mm}:{ss}</span>
              </div>
            )}
            {status === "paid" && (
              <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
                <CheckCircle2 className="size-4" /> Payment received — your order is confirmed.
              </div>
            )}
            {status === "expired" && (
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-200">
                <span>This virtual account has expired.</span>
                <button onClick={regenerate} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 ring-1 ring-rose-200">
                  <RefreshCw className="size-3" /> Generate new
                </button>
              </div>
            )}
          </div>

          {/* Virtual account card */}
          <div className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 to-navy-800 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/80">
                <Building2 className="size-4" />
                <p className="text-[10px] font-semibold uppercase tracking-wider">Dedicated virtual account</p>
              </div>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                One-time
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <VARow label="Bank" value={virtualAccount.bank} onCopy={copy} />
              <VARow label="Account number" value={virtualAccount.accountNumber} onCopy={copy} highlight />
              <VARow label="Account name" value={virtualAccount.accountName} onCopy={copy} />
              <VARow
                label="Amount"
                value={property ? formatNaira(Number(property.price), property.listing_type) : "—"}
                onCopy={copy}
              />
            </div>

            <p className="mt-5 text-[11px] leading-relaxed text-white/70">
              Transfer the exact amount from any Nigerian bank app to the account above. This account is unique
              to this order and expires in 30 minutes. Payment is verified automatically — you don't need to
              upload proof.
            </p>
          </div>

          {/* How it works */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Step n={1} title="Copy details" body="Copy the account number and amount above." />
            <Step n={2} title="Send transfer" body="Pay from any Nigerian bank app or USSD." />
            <Step n={3} title="Auto-confirmed" body="We detect the transfer and mark your order paid." />
          </div>

          {/* Dev helper — remove once provider webhook is live */}
          <button
            onClick={() => setStatus("paid")}
            className="mt-6 w-full rounded-full bg-navy-50 py-3 text-xs font-medium text-navy-700 ring-1 ring-black/5"
          >
            Simulate payment received (preview)
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function VARow({
  label,
  value,
  onCopy,
  highlight,
}: {
  label: string;
  value: string;
  onCopy: (v: string, l: string) => void;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">{label}</p>
        <p className={`truncate font-display font-semibold ${highlight ? "text-2xl tracking-wide" : "text-sm"}`}>
          {value}
        </p>
      </div>
      <button
        onClick={() => onCopy(value, label)}
        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/15 hover:bg-white/15"
      >
        <Copy className="size-3" /> Copy
      </button>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-navy-50 p-4">
      <div className="flex size-6 items-center justify-center rounded-full bg-navy-950 text-[11px] font-semibold text-white">
        {n}
      </div>
      <p className="mt-2 font-display text-sm font-semibold text-navy-950">{title}</p>
      <p className="mt-0.5 text-xs text-navy-700">{body}</p>
    </div>
  );
}
