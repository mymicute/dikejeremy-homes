import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard, Building2, Copy, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/site/Header";
import { BottomNav } from "@/components/site/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira } from "@/lib/mock-data";
import type { Tables } from "@/integrations/supabase/types";

// Admin bank details for direct transfer — replace with real values later.
const ADMIN_BANK = {
  bank: "Guaranty Trust Bank (GTBank)",
  accountName: "Dejedy Marketplace Ltd",
  accountNumber: "0123456789",
};

export const Route = createFileRoute("/checkout/$id")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Secure checkout — Dejedy" },
      { name: "description", content: "Reserve or pay for a listing securely through Dejedy." },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const { id } = Route.useParams();
  const [property, setProperty] = useState<Tables<"properties"> | null>(null);
  const [tab, setTab] = useState<"card" | "transfer">("card");

  useEffect(() => {
    supabase.from("properties").select("*").eq("id", id).maybeSingle().then(({ data }) => setProperty(data));
  }, [id]);

  function copy(value: string, label: string) {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied`);
  }

  function payWithCard() {
    toast("Card payments (Paystack) will be enabled once the admin adds Paystack API keys.");
  }

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
            <p className="text-xs font-semibold uppercase tracking-wider">Paid to Dejedy admin — never the agent</p>
          </div>

          <h1 className="font-display text-3xl font-semibold text-navy-950">Secure checkout</h1>
          {property && (
            <p className="mt-1 text-sm text-navy-700">
              {property.title} · <span className="font-semibold text-navy-950">{formatNaira(Number(property.price), property.listing_type)}</span>
            </p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-navy-50 p-1">
            <button onClick={() => setTab("card")} className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${tab === "card" ? "bg-navy-950 text-white" : "text-navy-950"}`}>
              <CreditCard className="size-4" /> Card
            </button>
            <button onClick={() => setTab("transfer")} className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${tab === "transfer" ? "bg-navy-950 text-white" : "text-navy-950"}`}>
              <Building2 className="size-4" /> Bank transfer
            </button>
          </div>

          {tab === "card" ? (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-navy-700">
                Pay by debit/credit card via Paystack. Funds settle to the Dejedy admin account, not the agent.
              </p>
              <button onClick={payWithCard} className="w-full rounded-full bg-navy-950 py-3 text-sm font-medium text-white">
                Pay with card
              </button>
              <p className="text-[11px] text-navy-700">
                Card payments require a Paystack account. Add your Paystack secret key to enable live card payments.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-navy-700">Transfer to the Dejedy admin account. Include the property ID as the reference.</p>
              <BankRow label="Bank" value={ADMIN_BANK.bank} onCopy={copy} />
              <BankRow label="Account name" value={ADMIN_BANK.accountName} onCopy={copy} />
              <BankRow label="Account number" value={ADMIN_BANK.accountNumber} onCopy={copy} />
              <BankRow label="Reference" value={id.slice(0, 8).toUpperCase()} onCopy={copy} />
              <p className="text-[11px] text-navy-700">
                After transferring, tap "I've paid" and our team will confirm within 24 hours.
              </p>
              <button onClick={() => toast.success("Thanks — we'll confirm your transfer shortly.")} className="w-full rounded-full bg-navy-950 py-3 text-sm font-medium text-white">
                I've paid
              </button>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

function BankRow({ label, value, onCopy }: { label: string; value: string; onCopy: (v: string, l: string) => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-navy-50 px-4 py-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-navy-700">{label}</p>
        <p className="font-display text-sm font-semibold text-navy-950">{value}</p>
      </div>
      <button onClick={() => onCopy(value, label)} className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-navy-950 ring-1 ring-black/5">
        <Copy className="size-3" /> Copy
      </button>
    </div>
  );
}
