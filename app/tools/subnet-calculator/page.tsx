import type { Metadata } from "next";
import { ToolHeader } from "@/components/tools/tool-header";
import { ToolWrapper } from "@/components/tools/tool-wrapper";
import { SubnetCalculatorClient } from "./subnet-calculator-client";

export const metadata: Metadata = {
  title: "Online IPv4 Subnet Calculator - CIDR Network Planner",
  description:
    "Free client-side subnet calculator. Input IP and prefix/CIDR to calculate network address, broadcast address, usable hosts, netmask, and binary bit ranges.",
  keywords: [
    "subnet calculator",
    "cidr calculator",
    "ip subnetting",
    "ipv4 calculator",
    "network address calculator",
    "broadcast address calculator",
    "wildcard mask",
  ],
  openGraph: {
    title: "IPv4 Subnet Calculator & CIDR Planner - DevToolBox",
    description:
      "A fast client-side IP subnet planner. Compute network parameters, host ranges, subnet masks, and view visual binary divisions instantly.",
    type: "website",
    url: "https://devtoolbox.com/tools/subnet-calculator",
  },
  alternates: {
    canonical: "/tools/subnet-calculator",
  },
};

export default function SubnetCalculatorPage() {
  const instructions = {
    title: "IPv4 Subnet Calculator",
    steps: [
      "Enter an IPv4 address (e.g. `192.168.1.1` or `10.0.0.5`).",
      "Select your CIDR prefix length (from `/1` to `/32`) using the dropdown or CIDR prefix selector.",
      "The tool instantly computes the Network Address, Netmask, Broadcast IP, usable Host IP Range, total host availability, and IP address class (A, B, C, D, E).",
      "Inspect the **Binary Bit Representation** diagram which visually isolates the Network Bits from the Host Bits in color-coded bytes.",
      "Copy any calculation result to your clipboard with one click.",
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "IPv4 Subnet Calculator",
    "url": "https://devtoolbox.com/tools/subnet-calculator",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "description":
      "Free offline-capable calculator to compute IPv4 subnet masks, CIDR network sizes, host ranges, and binary notations.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-6">
        <ToolHeader
          title="IPv4 Subnet Calculator"
          description="Calculate network parameters, usable ranges, netmasks, wildcard bits, and view structural binary divisions instantly."
          category="converters"
        />

        <ToolWrapper
          currentToolId="subnet-calculator"
          currentCategory="converters"
          instructions={instructions}
        >
          <SubnetCalculatorClient />
        </ToolWrapper>
      </div>
    </>
  );
}
