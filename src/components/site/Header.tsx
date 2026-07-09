import { Link } from "@tanstack/react-router";

const navLinks = [
  { to: "/browse", label: "Buy", search: { listingType: "Buy" } },
  { to: "/browse", label: "Rent", search: { listingType: "Rent" } },
  { to: "/browse", label: "Short Let", search: { listingType: "Short Let" } },
  { to: "/cars", label: "Cars", search: undefined },
  { to: "/services", label: "Services", search: undefined },
  { to: "/agents", label: "Agents", search: undefined },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-navy-950/5 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-display text-xl font-semibold tracking-tight text-navy-950">
            Dejedy
          </Link>
          <nav className="hidden gap-6 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                search={l.search as never}
                className="text-sm font-medium text-navy-700 hover:text-navy-950"
                activeProps={{ className: "text-navy-950" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/auth" className="hidden text-sm font-medium text-navy-950 md:inline">
            Sign in
          </Link>
          <Link
            to="/list-property"
            className="rounded-full bg-navy-950 px-4 py-2 text-sm font-medium text-white ring-1 ring-navy-950 transition-transform active:scale-95 md:px-5"
          >
            List Property
          </Link>
        </div>
      </div>
    </header>
  );
}
