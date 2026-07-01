import { Link } from "@tanstack/react-router";
import { Bed, Bath, Ruler, BadgeCheck } from "lucide-react";
import { formatNaira, type Property } from "@/lib/mock-data";

export function PropertyCard({
  property,
  size = "md",
}: {
  property: Property;
  size?: "sm" | "md" | "lg";
}) {
  const aspect = size === "lg" ? "aspect-[4/5]" : size === "sm" ? "aspect-square" : "aspect-[4/3]";
  return (
    <Link
      to="/property/$id"
      params={{ id: property.id }}
      className="group block overflow-hidden rounded-3xl bg-card p-3 ring-1 ring-black/5 transition hover:ring-navy-700/30 md:p-4"
    >
      <div className={`relative mb-3 w-full overflow-hidden rounded-2xl bg-muted ${aspect}`}>
        <img
          src={property.images[0]}
          alt={property.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {property.verified && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-500/20">
            <BadgeCheck className="size-3" /> VERIFIED
          </span>
        )}
      </div>
      <div className="mb-1 flex items-center justify-between text-xs font-medium text-navy-700">
        <span>{property.area}, {property.city}</span>
        <span className="uppercase tracking-wider text-[10px]">{property.listingType}</span>
      </div>
      <h3 className="font-display text-lg font-semibold text-navy-950">
        {formatNaira(property.price, property.listingType)}
      </h3>
      <p className="mt-0.5 line-clamp-1 text-sm text-navy-700">{property.title}</p>
      {property.beds > 0 && (
        <div className="mt-3 flex items-center gap-4 border-t border-black/5 pt-3 text-xs text-navy-700">
          <span className="inline-flex items-center gap-1"><Bed className="size-3.5" /> {property.beds}</span>
          <span className="inline-flex items-center gap-1"><Bath className="size-3.5" /> {property.baths}</span>
          <span className="inline-flex items-center gap-1"><Ruler className="size-3.5" /> {property.sizeSqm}m²</span>
        </div>
      )}
    </Link>
  );
}
