import { Tool, CategoryInfo, FAQItem } from "@/types";

export const CATEGORIES: CategoryInfo[] = [
  {
    id: "formatters",
    name: "Formatters & Validators",
    description: "Format, validate, clean, and beautify your raw data structures.",
    icon: "Braces",
  },
  {
    id: "encoders",
    name: "Encoders & Decoders",
    description: "Encode and decode text data and binary files safely.",
    icon: "Key",
  },
  {
    id: "generators",
    name: "Generators",
    description: "Generate highly secure passwords, mock parameters, and identifiers.",
    icon: "Cpu",
  },
  {
    id: "converters",
    name: "Converters & Parsers",
    description: "Convert colors, timestamps, numeric bases, and formats.",
    icon: "Shuffle",
  },
  {
    id: "developers",
    name: "Developer Utilities",
    description: "Handy web utilities for checking status, expressions, and hashes.",
    icon: "Terminal",
  },
];

export const TOOLS: Tool[] = [
  {
    id: "json-formatter",
    name: "JSON Formatter & Validator",
    description: "Beautify, validate, minify, and inspect JSON structures with live syntax parsing.",
    category: "formatters",
    href: "/tools/json-formatter",
    icon: "Braces",
    keywords: ["json", "formatter", "validator", "beautify", "minify", "parse", "pretty print"],
    isFeatured: true,
    isPopular: true,
  },
  {
    id: "base64-decoder",
    name: "Base64 Encoder / Decoder",
    description: "Encode and decode text or binary files into URL-safe Base64 strings.",
    category: "encoders",
    href: "/tools/base64-decoder",
    icon: "FileText",
    keywords: ["base64", "encoder", "decoder", "urlsafe", "binary to base64", "base64 to file"],
    isFeatured: true,
    isPopular: true,
  },
  {
    id: "password-generator",
    name: "Secure Password Generator",
    description: "Generate secure random passwords or memorable passphrases with real-time strength evaluation.",
    category: "generators",
    href: "/tools/password-generator",
    icon: "Lock",
    keywords: ["password", "generator", "passphrase", "entropy", "random", "security", "credentials"],
    isFeatured: true,
    isPopular: true,
  },
  // Placeholders for future tools (will show as active/accessible once built)
  {
    id: "jwt-decoder",
    name: "JWT Decoder",
    description: "Decode and inspect JSON Web Tokens (JWT) payload, header, and signature status client-side.",
    category: "developers",
    href: "/tools/jwt-decoder",
    icon: "ShieldAlert",
    keywords: ["jwt", "decoder", "token", "json web token", "auth", "inspect"],
  },
  {
    id: "regex-tester",
    name: "Regex Tester",
    description: "Test regular expressions in real-time with sample input match highlighting and explanation.",
    category: "developers",
    href: "/tools/regex-tester",
    icon: "Binary",
    keywords: ["regex", "tester", "regular expression", "match", "replace", "pattern"],
  },
  {
    id: "uuid-generator",
    name: "UUID / GUID Generator",
    description: "Generate standard RFC 4122 compliant UUID v4 and v1 strings in bulk formats.",
    category: "generators",
    href: "/tools/uuid-generator",
    icon: "Fingerprint",
    keywords: ["uuid", "guid", "generator", "random", "rfc4122", "bulk uuid"],
  },
  {
    id: "timestamp-converter",
    name: "Timestamp Converter",
    description: "Convert Unix epoch timestamps to human-readable dates and vice-versa instantly.",
    category: "converters",
    href: "/tools/timestamp-converter",
    icon: "Clock",
    keywords: ["timestamp", "epoch", "unix", "date", "converter", "utc", "timezone"],
  },
  {
    id: "color-converter",
    name: "Color Converter (HEX/RGB/HSL)",
    description: "Convert color models between HEX, RGB, HSL and evaluate color contrast metrics.",
    category: "converters",
    href: "/tools/color-converter",
    icon: "Palette",
    keywords: ["color", "converter", "hex", "rgb", "hsl", "contrast", "palette"],
  },
  {
    id: "sha256-hash",
    name: "SHA256 Hash Generator",
    description: "Compute cryptographic SHA-256 and other secure hashes from text or files client-side.",
    category: "developers",
    href: "/tools/sha-256",
    icon: "Hash",
    keywords: ["sha256", "hash", "generator", "md5", "cryptography", "digest"],
  },
  {
    id: "http-status-explorer",
    name: "HTTP Status Code Explorer",
    description: "Browse HTTP status codes with semantic descriptions, RFC references, and sample headers.",
    category: "developers",
    href: "/tools/http-status",
    icon: "Compass",
    keywords: ["http", "status code", "explorer", "rfc", "200 OK", "404", "500"],
  },
];

export const FAQS: FAQItem[] = [
  {
    question: "Are my files or text inputs sent to a server?",
    answer: "Absolutely not. DevToolBox is designed with a client-side first architecture. All formatting, decoding, password generation, and conversions are done locally in your browser. No input text, files, or sensitive secrets ever leave your machine.",
  },
  {
    question: "Is DevToolBox free to use?",
    answer: "Yes, all our tools are 100% free to use. We support our hosting costs through non-intrusive developer-friendly advertisements and plan to offer premium ad-free experiences with saved historical pipelines in the future.",
  },
  {
    question: "Can I use DevToolBox offline?",
    answer: "Yes. Once the website loads, because our tools run entirely client-side, they will continue to function fully even if you lose your internet connection.",
  },
  {
    question: "How secure is the Password Generator?",
    answer: "It uses the browser's native window.crypto.getRandomValues() API, which is a Cryptographically Secure Pseudo-Random Number Generator (CSPRNG). This guarantees that passwords generated are mathematically secure and unpredictable.",
  },
];
