import { createFileRoute } from "@tanstack/react-router";
import { PropertyCategoryPage } from "@/components/site/PropertyCategoryPage";

export const Route = createFileRoute("/land")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Land for sale in Nigeria — Dejedy" },
      {
        name: "description",
        content:
          "Browse verified plots, acres and commercial land for sale across Lagos, Abuja and every Nigerian state on Dejedy.",
      },
      { property: "og:title", content: "Land for sale in Nigeria — Dejedy" },
      {
        property: "og:description",
        content: "Verified plots, acres and commercial land listings across Nigeria.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <PropertyCategoryPage
      eyebrow="Category"
      title="Land"
      blurb="Plots, acres and commercial land with documented titles across Nigeria."
      types={["Land", "Commercial", "Warehouse"]}
    />
  ),
});
