import type { Metadata } from "next";
import { ToolHeader } from "@/components/tools/tool-header";
import { ToolWrapper } from "@/components/tools/tool-wrapper";
import { PasswordClient } from "./password-client";

export const metadata: Metadata = {
  title: "Online Secure Password Generator - CSPRNG Credentials Tool",
  description:
    "Free online password generator. Generate secure random passwords or memorable passphrases with window.crypto CSPRNG, strength estimation, and zero server logging.",
  keywords: [
    "password generator",
    "secure password",
    "passphrase generator",
    "CSPRNG password",
    "random password",
    "password strength",
    "entropy calculator",
    "credentials generator",
  ],
  openGraph: {
    title: "Online Secure Password Generator - DevToolBox",
    description:
      "Generate cryptographically secure random passwords or readable word passphrases instantly. Features password entropy calculations and historical session logs.",
    type: "website",
    url: "https://devtoolbox.com/tools/password-generator",
  },
  alternates: {
    canonical: "/tools/password-generator",
  },
};

export default function PasswordGeneratorPage() {
  const instructions = {
    title: "Secure Password Generator",
    steps: [
      "Select your generation mode: choose 'Secure Password' for a random string of characters, or 'Memorable Passphrase' to join random English words.",
      "Adjust the length slider (4 to 128 characters for passwords, or 3 to 15 words for passphrases).",
      "Check the character set filters (Uppercase, Lowercase, Numbers, and Special Symbols) according to your security requirements.",
      "Enable 'Exclude Similar' to filter out ambiguous characters like O/0 or I/1 which look similar in certain fonts.",
      "The tool calculates the password's Shannon Entropy in real-time, along with a rating of the strength and an estimate of the time required to crack it.",
      "Click 'Copy' to store it in your clipboard. You can view the session log history below to retrieve previously generated credentials.",
    ],
  };

  // Structured Data (JSON-LD)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Secure Password Generator",
    "url": "https://devtoolbox.com/tools/password-generator",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "description":
      "Free client-side secure password and passphrase generator using cryptographically secure values (CSPRNG).",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-6">
        <ToolHeader
          title="Secure Password Generator"
          description="Generate cryptographically secure random passwords or memorable passphrases locally in your browser. Powered by window.crypto CSPRNG."
          category="generators"
        />

        <ToolWrapper
          currentToolId="password-generator"
          currentCategory="generators"
          instructions={instructions}
        >
          <PasswordClient />
        </ToolWrapper>
      </div>
    </>
  );
}
