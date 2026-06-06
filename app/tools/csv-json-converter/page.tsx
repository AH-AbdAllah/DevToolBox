import type { Metadata } from "next";
import { ToolHeader } from "@/components/tools/tool-header";
import { ToolWrapper } from "@/components/tools/tool-wrapper";
import { CsvJsonClient } from "./csv-json-client";

export const metadata: Metadata = {
  title: "Online CSV to JSON & JSON to CSV Converter - Grid Preview",
  description:
    "Free client-side tool to convert CSV data to JSON and JSON to CSV. Features an interactive, editable table spreadsheet grid view with text filtering.",
  keywords: [
    "csv to json",
    "json to csv",
    "csv converter",
    "json converter",
    "interactive table grid",
    "edit csv online",
    "csv file viewer",
  ],
  openGraph: {
    title: "CSV to JSON & JSON to CSV Converter - DevToolBox",
    description:
      "Convert tabular data between CSV and JSON. Preview, search, and edit records in a local browser table. Zero server uploads.",
    type: "website",
    url: "https://devtoolbox.com/tools/csv-json-converter",
  },
  alternates: {
    canonical: "/tools/csv-json-converter",
  },
};

export default function CsvJsonConverterPage() {
  const instructions = {
    title: "CSV / JSON Converter & Grid",
    steps: [
      "Paste your raw CSV content (using commas or semicolons) or JSON array records into the Input text area, or upload a local file (.csv, .json).",
      "The tool automatically parses the input client-side and populates the **Interactive Table Grid** below.",
      "You can search and filter table rows using the 'Filter rows...' search bar, or edit individual cells by double-clicking them.",
      "Switch between 'Convert to JSON' or 'Convert to CSV' options.",
      "Copy the converted code or download the result as a text file.",
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "CSV / JSON Converter",
    "url": "https://devtoolbox.com/tools/csv-json-converter",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "description":
      "Convert files and raw data between CSV and JSON. Edit and filter rows in a live browser spreadsheet grid.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-6">
        <ToolHeader
          title="CSV / JSON Converter & Grid"
          description="Convert data formats between CSV and JSON. Edit cells and search rows in real-time in a live table preview. 100% private."
          category="converters"
        />

        <ToolWrapper
          currentToolId="csv-json-converter"
          currentCategory="converters"
          instructions={instructions}
        >
          <CsvJsonClient />
        </ToolWrapper>
      </div>
    </>
  );
}
