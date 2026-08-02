import { createFileRoute } from "@tanstack/react-router";
import { PropertyCategoryPage } from "@/components/site/PropertyCategoryPage";

export const Route = createFileRoute("/residential")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Residential homes for sale & rent — Dejedy" },
      {
        name: "description",
        content:
          "Apartments, duplexes, bungalows, terraces and self-contains for sale or rent across Nigeria on Dejedy.",
      },
      { property: "og:title", content: "Residential homes — Dejedy" },
      {
        property: "og:description",
        content: "Apartments, duplexes, bungalows and terraces across Nigeria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <PropertyCategoryPage
      eyebrow="Category"
      title="Residential"
      blurb="Apartments, duplexes, bungalows, terraces, studios and self-contains to buy or rent."
      types={["Apartment", "Duplex", "Bungalow", "Self Contain", "Studio", "Terrace", "Penthouse"]}
    />
  ),
});
