import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Home, Heart, MessageCircle, Settings, User, LayoutGrid, X } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/favorites", label: "Saved", icon: Heart },
  { to: "/messages", label: "Chats", icon: MessageCircle },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/profile", label: "Profile", icon: User },
] as const;

const groups = [
  {
    title: "Residential",
    to: "/browse",
    items: ["Apartment", "Duplex", "Bungalow", "Self Contain", "Studio", "Terrace", "Penthouse"],
  },
  {
    title: "Short Stay",
    to: "/browse",
    items: ["Short Let", "Serviced Apartment", "Guest House", "Hotel Room"],
  },
  {
    title: "Commercial & Land",
    to: "/browse",
    items: ["Office Space", "Shop", "Warehouse", "Land", "Commercial", "Event Centre"],
  },
  {
    title: "Cars",
    to: "/cars",
    items: ["Buy", "Rent", "Brand New", "Foreign Used", "Nigerian Used"],
  },
  {
    title: "Electronics",
    to: "/electronics",
    items: ["Phones", "Laptops", "TVs", "Audio", "Gaming", "Appliances", "Accessories"],
  },
  {
    title: "Services",
    to: "/services",
    items: ["Painting", "Cleaning", "Plumbing", "Electrical", "Carpentry", "AC Repair", "Fumigation"],
  },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 max-h-[75vh] overflow-y-auto rounded-t-3xl bg-card p-5 pb-28 ring-1 ring-border"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Categories</h2>
              <button
                onClick={() => setOpen(false)}
                className="grid size-8 place-items-center rounded-full bg-muted text-foreground"
                aria-label="Close categories"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="space-y-5">
              {groups.map((g) => (
                <div key={g.title}>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {g.title}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {g.items.map((c) => (
                      <Link
                        key={g.title + c}
                        to={g.to}
                        search={{ type: c } as never}
                        onClick={() => setOpen(false)}
                        className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground ring-1 ring-border hover:bg-primary hover:text-primary-foreground"
                      >
                        {c}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full bg-navy-950 px-3 py-2 text-white shadow-2xl ring-1 ring-white/10">
        {items.slice(0, 3).map(({ to, label, icon: Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition ${
                active ? "bg-white/10 opacity-100" : "opacity-60"
              }`}
            >
              <Icon className="size-4" strokeWidth={2} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition ${
            open ? "bg-white/10 opacity-100" : "opacity-60"
          }`}
        >
          <LayoutGrid className="size-4" strokeWidth={2} />
          <span className="text-[10px] font-medium">Categories</span>
        </button>
        {items.slice(3).map(({ to, label, icon: Icon }) => {
          const active = pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 transition ${
                active ? "bg-white/10 opacity-100" : "opacity-60"
              }`}
            >
              <Icon className="size-4" strokeWidth={2} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
