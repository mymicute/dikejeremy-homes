import { createFileRoute } from "@tanstack/react-router";
import { PropertyCategoryPage } from "@/components/site/PropertyCategoryPage";

export const Route = createFileRoute("/short-stay")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Short lets & serviced apartments in Nigeria — Dejedy" },
      {
        name: "description",
        content:
          "Book short lets, serviced apartments, guest houses and hotel rooms by the night across Nigeria on Dejedy.",
      },
      { property: "og:title", content: "Short stay — Dejedy" },
      {
        property: "og:description",
        content: "Short lets, serviced apartments and guest houses across Nigeria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <PropertyCategoryPage
      eyebrow="Category"
      title="Short stay"
      blurb="Nightly and weekly stays — short lets, serviced apartments, guest houses and hotel rooms."
      types={["Short Let", "Serviced Apartment", "Guest House", "Hotel Room"]}
      listingTypes={["Short Let"]}
    />
  ),
});
