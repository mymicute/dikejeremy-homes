import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/site/Header";
import { Mail, Phone, Lock } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — DikeJeremy" },
      { name: "description", content: "Sign in or create your DikeJeremy account." },
    ],
  }),
  component: Auth,
});

function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [tab, setTab] = useState<"email" | "phone">("email");

  return (
    <div className="min-h-screen bg-navy-50">
      <Header />
      <main className="mx-auto grid max-w-md gap-6 px-4 py-10 md:py-16">
        <div>
          <h1 className="font-display text-3xl font-semibold text-navy-950">
            {mode === "signin" ? "Welcome back" : "Join DikeJeremy"}
          </h1>
          <p className="mt-2 text-sm text-navy-700">
            {mode === "signin" ? "Sign in to save homes and message agents." : "Create an account to save homes and book inspections."}
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
          <div className="mb-5 flex rounded-full bg-navy-50 p-1 text-sm font-medium">
            <button
              onClick={() => setTab("email")}
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

          <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
            {tab === "email" ? (
              <>
                <Field icon={<Mail className="size-4" />} type="email" placeholder="you@example.com" />
                <Field icon={<Lock className="size-4" />} type="password" placeholder="Password" />
              </>
            ) : (
              <>
                <Field icon={<Phone className="size-4" />} type="tel" placeholder="+234 800 000 0000" />
                <p className="text-xs text-navy-700">We'll send a one-time code via SMS.</p>
              </>
            )}
            <button className="w-full rounded-full bg-navy-950 py-3 text-sm font-medium text-white">
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-navy-700">
            <div className="h-px flex-1 bg-black/5" />or<div className="h-px flex-1 bg-black/5" />
          </div>

          <button className="w-full rounded-full bg-white py-3 text-sm font-medium text-navy-950 ring-1 ring-black/10 hover:bg-navy-50">
            Continue with Google
          </button>
        </div>

        <p className="text-center text-sm text-navy-700">
          {mode === "signin" ? "New to DikeJeremy?" : "Have an account?"}{" "}
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
