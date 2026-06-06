import type { Metadata } from "next";
import { ToolHeader } from "@/components/tools/tool-header";
import { ToolWrapper } from "@/components/tools/tool-wrapper";
import { TailwindPlaygroundClient } from "./tailwind-playground-client";

export const metadata: Metadata = {
  title: "Online Tailwind CSS Layout Playground - Flexbox & Grid Builder",
  description:
    "Visually construct, design, and preview Tailwind CSS Flexbox and Grid layouts. Add items, toggle responsive classes, and copy clean HTML markup instantly.",
  keywords: [
    "tailwind css generator",
    "flexbox generator",
    "css grid generator",
    "tailwind playground",
    "visual layout builder",
    "flex rows",
    "grid columns",
  ],
  openGraph: {
    title: "Tailwind CSS Flexbox & Grid Layout Playground - DevToolBox",
    description:
      "A client-side visual tool to prototype and inspect CSS layouts using Tailwind classes. Tweak parameters and get copy-pasteable HTML templates.",
    type: "website",
    url: "https://devtoolbox.com/tools/tailwind-playground",
  },
  alternates: {
    canonical: "/tools/tailwind-playground",
  },
};

export default function TailwindPlaygroundPage() {
  const instructions = {
    title: "Tailwind CSS Layout Designer",
    steps: [
      "Select the layout model: choose **Flexbox** to layout items in single rows/columns, or **Grid** to organize boxes in columns and rows.",
      "Use the controls sidebar to adjust properties like container directions, item wraps, spacing gap values, horizontal alignments, and column grids.",
      "Add or remove mock boxes inside the canvas using the '+ Add Item' and '- Remove' controllers.",
      "Click on any individual mock box in the visual canvas to open **Item-Specific Settings** (set custom width, height, background colors, alignments, or flex grow/shrink weights).",
      "Copy the generated HTML code from the bottom code panel to drop directly into your Tailwind project.",
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Tailwind CSS Layout Playground",
    "url": "https://devtoolbox.com/tools/tailwind-playground",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "description":
      "Visually design, align, and generate HTML markup templates configured with Tailwind CSS Flex and Grid classes.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-6">
        <ToolHeader
          title="Tailwind CSS Layout Designer"
          description="Build responsive CSS Flexbox and Grid structures visually. Select items to customize details, and grab production-ready HTML code."
          category="developers"
        />

        <ToolWrapper
          currentToolId="tailwind-playground"
          currentCategory="developers"
          instructions={instructions}
        >
          <TailwindPlaygroundClient />
        </ToolWrapper>
      </div>
    </>
  );
}
