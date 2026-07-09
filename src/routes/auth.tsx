import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Mail, Phone, Lock, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Dejedy" },
      { name: "description", content: "Sign in or create your Dejedy account." },
    ],
  }),
  component: Auth,
});

const emailSchema = z.string().trim().email("Enter a valid email").max(255);
const passwordSchema = z.string().min(6, "Password must be at least 6 characters").max(72);
const phoneSchema = z.string().trim().regex(/^\+?[0-9]{10,15}$/, "Enter a valid phone number (e.g. +2348012345678)");
const nameSchema = z.string().trim().min(2, "Enter your name").max(100);

function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [loading, setLoading] = useState(false);

  // email/password
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // phone
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Redirect if already signed in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const parsedEmail = emailSchema.parse(email);
      const parsedPassword = passwordSchema.parse(password);

      if (mode === "signup") {
        const parsedName = nameSchema.parse(fullName);
        const { error } = await supabase.auth.signUp({
          email: parsedEmail,
          password: parsedPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: parsedName },
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm.");
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsedEmail,
          password: parsedPassword,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/" });
      }
    } catch (err: any) {
      const msg = err instanceof z.ZodError ? err.issues[0].message : err.message || "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const parsedPhone = phoneSchema.parse(phone);
      const { error } = await supabase.auth.signInWithOtp({
        phone: parsedPhone.startsWith("+") ? parsedPhone : `+${parsedPhone}`,
      });
      if (error) throw error;
      setOtpSent(true);
      toast.success("Code sent via SMS");
    } catch (err: any) {
      const msg = err instanceof z.ZodError ? err.issues[0].message : err.message || "Could not send code";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const parsedPhone = phoneSchema.parse(phone);
      const { error } = await supabase.auth.verifyOtp({
        phone: parsedPhone.startsWith("+") ? parsedPhone : `+${parsedPhone}`,
        token: otp.trim(),
        type: "sms",
      });
      if (error) throw error;
      toast.success("Signed in");
      navigate({ to: "/" });
    } catch (err: any) {
      toast.error(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message || "Google sign-in failed");
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/" });
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    try {
      const parsedEmail = emailSchema.parse(email);
      const { error } = await supabase.auth.resetPasswordForEmail(parsedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset link sent");
    } catch (err: any) {
      const msg = err instanceof z.ZodError ? "Enter your email above first" : err.message;
      toast.error(msg);
    }
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <Header />
      <main className="mx-auto grid max-w-md gap-6 px-4 py-10 md:py-16">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy-950">
            {mode === "signin" ? "Welcome back" : "Join Dejedy"}
          </h1>
          <p className="mt-2 text-sm text-navy-700">
            {mode === "signin" ? "Sign in to save homes and message agents." : "Create an account to save homes and book inspections."}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
          <div className="mb-5 flex rounded-full bg-navy-50 p-1 text-sm font-medium">
            <button
              onClick={() => { setTab("email"); setOtpSent(false); }}
              className={`flex-1 rounded-full py-2 ${tab === "email" ? "bg-white text-navy-950 shadow-sm" : "text-navy-700"}`}
            >
              Email
            </button>
            <button
              onClick={() => setTab("phone")}
              className={`flex-1 rounded-full py-2 ${tab === "phone" ? "bg-white text-navy-950 shadow-sm" : "text-navy-700"}`}
            >
              Phone
            </button>
          </div>

          {tab === "email" ? (
            <form className="space-y-3" onSubmit={handleEmailSubmit}>
              {mode === "signup" && (
                <Field icon={<User className="size-4" />} type="text" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              )}
              <Field icon={<Mail className="size-4" />} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Field icon={<Lock className="size-4" />} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              {mode === "signin" && (
                <button type="button" onClick={handleForgotPassword} className="block text-right text-xs text-navy-700 hover:underline w-full">
                  Forgot password?
                </button>
              )}
              <button disabled={loading} className="w-full rounded-full bg-navy-950 py-3 text-sm font-medium text-white disabled:opacity-60">
                {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
              </button>
            </form>
          ) : !otpSent ? (
            <form className="space-y-3" onSubmit={handleSendOtp}>
              <Field icon={<Phone className="size-4" />} type="tel" placeholder="+2348012345678" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              <p className="text-xs text-navy-700">We'll send a one-time code via SMS.</p>
              <button disabled={loading} className="w-full rounded-full bg-navy-950 py-3 text-sm font-medium text-white disabled:opacity-60">
                {loading ? "Sending…" : "Send code"}
              </button>
            </form>
          ) : (
            <form className="space-y-3" onSubmit={handleVerifyOtp}>
              <Field icon={<Lock className="size-4" />} type="text" inputMode="numeric" placeholder="6-digit code" value={otp} onChange={(e) => setOtp(e.target.value)} required />
              <button disabled={loading} className="w-full rounded-full bg-navy-950 py-3 text-sm font-medium text-white disabled:opacity-60">
                {loading ? "Verifying…" : "Verify & continue"}
              </button>
              <button type="button" onClick={() => setOtpSent(false)} className="w-full text-xs text-navy-700 hover:underline">
                Use a different number
              </button>
            </form>
          )}

          <div className="my-5 flex items-center gap-3 text-xs text-navy-700">
            <div className="h-px flex-1 bg-black/5" />or<div className="h-px flex-1 bg-black/5" />
          </div>

          <button onClick={handleGoogle} disabled={loading} className="w-full rounded-full bg-white py-3 text-sm font-medium text-navy-950 ring-1 ring-black/10 hover:bg-navy-50 disabled:opacity-60">
            Continue with Google
          </button>
        </div>

        <p className="text-center text-sm text-navy-700">
          {mode === "signin" ? "New to Dejedy?" : "Have an account?"}{" "}
          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="font-medium text-navy-950 underline"
          >
            {mode === "signin" ? "Create account" : "Sign in"}
          </button>
        </p>
        <p className="text-center text-xs text-navy-700">
          <Link to="/">← Back home</Link>
        </p>
      </main>
    </div>
  );
}

function Field({ icon, ...props }: { icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-navy-50 px-4 py-3 ring-1 ring-transparent focus-within:ring-navy-700">
      <span className="text-navy-700">{icon}</span>
      <input {...props} className="flex-1 bg-transparent text-sm outline-none placeholder:text-navy-700/60" />
    </div>
  );
}
