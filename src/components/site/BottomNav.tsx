import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Heart, MessageCircle, Settings, User } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/favorites", label: "Saved", icon: Heart },
  { to: "/messages", label: "Chats", icon: MessageCircle },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-navy-950 px-3 py-2 text-white shadow-2xl ring-1 ring-white/10">
      {items.map(({ to, label, icon: Icon }) => {
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
    </nav>
  );
}
