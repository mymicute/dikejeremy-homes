import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Dejedy" },
      { name: "description", content: "Set a new password for your Dejedy account." },
    ],
  }),
  component: ResetPassword,
});

const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(72);

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const parsed = passwordSchema.parse(password);
      if (parsed !== confirm) throw new Error("Passwords do not match");
      const { error } = await supabase.auth.updateUser({ password: parsed });
      if (error) throw error;
      toast.success("Password updated");
      navigate({ to: "/" });
    } catch (err: any) {
      const msg = err instanceof z.ZodError ? err.issues[0].message : err.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <Header />
      <main className="mx-auto grid max-w-md gap-6 px-4 py-10 md:py-16">
        <h1 className="font-display text-3xl font-semibold text-navy-950">Set a new password</h1>
        {!ready ? (
          <p className="text-sm text-navy-700">Waiting for password reset link…</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 rounded-3xl bg-white p-6 ring-1 ring-black/5">
            <div className="flex items-center gap-2 rounded-2xl bg-navy-50 px-4 py-3">
              <Lock className="size-4 text-navy-700" />
              <input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required className="flex-1 bg-transparent text-sm outline-none" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-navy-50 px-4 py-3">
              <Lock className="size-4 text-navy-700" />
              <input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="flex-1 bg-transparent text-sm outline-none" />
            </div>
            <button disabled={loading} className="w-full rounded-full bg-navy-950 py-3 text-sm font-medium text-white disabled:opacity-60">
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
