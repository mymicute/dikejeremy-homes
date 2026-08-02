import { Link, useRouterState } from "@tanstack/react-router";
import { Home, LandPlot, Building2, BedDouble, Car, Smartphone, Wrench } from "lucide-react";

const left = [
  { to: "/land", label: "Land", icon: LandPlot },
  { to: "/residential", label: "Homes", icon: Building2 },
  { to: "/short-stay", label: "Stays", icon: BedDouble },
] as const;

const right = [
  { to: "/cars", label: "Cars", icon: Car },
  { to: "/electronics", label: "Tech", icon: Smartphone },
  { to: "/services", label: "Services", icon: Wrench },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const Item = ({
    to,
    label,
    icon: Icon,
  }: {
    to: string;
    label: string;
    icon: typeof Home;
  }) => {
    const active = pathname.startsWith(to);
    return (
      <Link
        to={to}
        className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-full px-1.5 py-1.5 transition ${
          active ? "bg-white/10 opacity-100" : "opacity-60"
        }`}
      >
        <Icon className="size-4" strokeWidth={2} />
        <span className="max-w-full truncate text-[9px] font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-3 left-1/2 z-50 flex w-[calc(100%-1rem)] max-w-[520px] -translate-x-1/2 items-center gap-0.5 rounded-full bg-navy-950 px-2 py-1.5 text-white shadow-2xl ring-1 ring-white/10">
      {left.map((i) => (
        <Item key={i.to} {...i} />
      ))}

      <Link
        to="/"
        aria-label="Home feed"
        className={`mx-0.5 grid size-11 shrink-0 place-items-center rounded-full transition ${
          pathname === "/" ? "bg-primary text-primary-foreground" : "bg-white/15 text-white"
        }`}
      >
        <Home className="size-5" strokeWidth={2.2} />
      </Link>

      {right.map((i) => (
        <Item key={i.to} {...i} />
      ))}
    </nav>
  );
}
