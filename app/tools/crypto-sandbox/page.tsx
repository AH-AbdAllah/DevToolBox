import type { Metadata } from "next";
import { ToolHeader } from "@/components/tools/tool-header";
import { ToolWrapper } from "@/components/tools/tool-wrapper";
import { CryptoSandboxClient } from "./crypto-sandbox-client";

export const metadata: Metadata = {
  title: "Online RSA & AES Encryption Sandbox - Web Crypto API",
  description:
    "Free client-side cryptographic sandbox. Generate public/private RSA-OAEP key pairs or AES-GCM secret keys, encrypt messages, and decrypt ciphertexts locally.",
  keywords: [
    "rsa encryption online",
    "aes encryption sandbox",
    "web crypto api generator",
    "generate rsa keys",
    "symmetric encryption GCM",
    "asymmetric cryptography browser",
    "encrypt text client-side",
  ],
  openGraph: {
    title: "RSA & AES Encryption Sandbox - DevToolBox",
    description:
      "Generate cryptographic keys and perform text encryption/decryption securely inside your browser via standard Web Crypto APIs. Zero server communication.",
    type: "website",
    url: "https://devtoolbox.com/tools/crypto-sandbox",
  },
  alternates: {
    canonical: "/tools/crypto-sandbox",
  },
};

export default function CryptoSandboxPage() {
  const instructions = {
    title: "RSA & AES Encryption Sandbox",
    steps: [
      "Select the encryption algorithm: choose **AES-GCM (Symmetric)** to use a single password/key, or **RSA-OAEP (Asymmetric)** to use Public/Private key pairs.",
      "For **AES-GCM**, generate a secret key and Initialization Vector (IV). Paste your plain text in the input panel and click 'Encrypt'. Use the generated ciphertext and key to decrypt.",
      "For **RSA-OAEP**, click 'Generate Key Pair'. The tool will create JWK-formatted keys. Share your Public Key with others to encrypt, and use your Private Key to decrypt.",
      "All operations are handled locally in your browser sandbox using the W3C Web Cryptography API. Keys and messages never leave your machine.",
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "RSA & AES Encryption Sandbox",
    "url": "https://devtoolbox.com/tools/crypto-sandbox",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "description":
      "Private browser-based key pair generator and text encryption utility powered by the Web Crypto API.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-6">
        <ToolHeader
          title="RSA & AES Encryption Sandbox"
          description="Perform secure asymmetric RSA-OAEP and symmetric AES-GCM encryption client-side. Generate cryptographic keys safely in your browser."
          category="encoders"
        />

        <ToolWrapper
          currentToolId="crypto-sandbox"
          currentCategory="encoders"
          instructions={instructions}
        >
          <CryptoSandboxClient />
        </ToolWrapper>
      </div>
    </>
  );
}
