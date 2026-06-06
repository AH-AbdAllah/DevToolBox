"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

// Helper: Convert hex string to byte array
const hexToBytes = (hex: string): Uint8Array => {
  const cleanHex = hex.replace(/[^A-Fa-f0-9]/g, "");
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
};

// Helper: Convert byte array to hex string
const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export function CryptoSandboxClient() {
  const [algo, setAlgo] = useState<"aes" | "rsa">("aes");
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");

  // AES States
  const [aesKeyHex, setAesKeyHex] = useState("");
  const [aesIvHex, setAesIvHex] = useState("");
  
  // RSA States
  const [rsaPublicKeyJwk, setRsaPublicKeyJwk] = useState("");
  const [rsaPrivateKeyJwk, setRsaPrivateKeyJwk] = useState("");

  // Common workspace text states
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"input" | "keys" | "output">("input");

  const { isCopied, copy } = useCopyToClipboard();

  // 1. Generate AES Secret Key & IV
  const generateAesParameters = async () => {
    try {
      const key = await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );
      const exported = await window.crypto.subtle.exportKey("raw", key);
      setAesKeyHex(bytesToHex(new Uint8Array(exported)));

      // Generate random 12-byte IV (96 bits) recommended for GCM
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      setAesIvHex(bytesToHex(iv));
      setError(null);
    } catch (err: any) {
      setError("Failed to generate AES parameters: " + err.message);
    }
  };

  // 2. Generate RSA Key Pair
  const generateRsaKeyPair = async () => {
    try {
      const pair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );

      const pubJwk = await window.crypto.subtle.exportKey("jwk", pair.publicKey);
      const privJwk = await window.crypto.subtle.exportKey("jwk", pair.privateKey);

      setRsaPublicKeyJwk(JSON.stringify(pubJwk, null, 2));
      setRsaPrivateKeyJwk(JSON.stringify(privJwk, null, 2));
      setError(null);
    } catch (err: any) {
      setError("Failed to generate RSA Key Pair: " + err.message);
    }
  };

  // 3. Perform Encryption or Decryption
  const handleCryptoOperation = async () => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }

    try {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      if (algo === "aes") {
        if (!aesKeyHex || !aesIvHex) {
          throw new Error("Secret Key and IV are required for AES operations.");
        }

        const keyBytes = hexToBytes(aesKeyHex);
        const ivBytes = hexToBytes(aesIvHex);

        const cryptoKey = await window.crypto.subtle.importKey(
          "raw",
          keyBytes as any,
          "AES-GCM",
          true,
          ["encrypt", "decrypt"]
        );

        if (mode === "encrypt") {
          const cipherBuffer = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: ivBytes as any },
            cryptoKey,
            encoder.encode(input)
          );
          setOutput(bytesToHex(new Uint8Array(cipherBuffer)));
        } else {
          const cipherBytes = hexToBytes(input);
          const plainBuffer = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: ivBytes as any },
            cryptoKey,
            cipherBytes as any
          );
          setOutput(decoder.decode(plainBuffer));
        }
      } else {
        // RSA-OAEP
        if (mode === "encrypt") {
          if (!rsaPublicKeyJwk.trim()) {
            throw new Error("Public Key is required to encrypt.");
          }
          const jwk = JSON.parse(rsaPublicKeyJwk);
          const cryptoKey = await window.crypto.subtle.importKey(
            "jwk",
            jwk,
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ["encrypt"]
          );

          const cipherBuffer = await window.crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            cryptoKey,
            encoder.encode(input)
          );
          // Export cipher as hex
          setOutput(bytesToHex(new Uint8Array(cipherBuffer)));
        } else {
          // Decrypt
          if (!rsaPrivateKeyJwk.trim()) {
            throw new Error("Private Key is required to decrypt.");
          }
          const jwk = JSON.parse(rsaPrivateKeyJwk);
          const cryptoKey = await window.crypto.subtle.importKey(
            "jwk",
            jwk,
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ["decrypt"]
          );

          const cipherBytes = hexToBytes(input);
          const plainBuffer = await window.crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            cryptoKey,
            cipherBytes as any
          );
          setOutput(decoder.decode(plainBuffer));
        }
      }
      setError(null);
      setMobileTab("output");
    } catch (err: any) {
      setError(err.message || "Crypto operation failed. Verify keys and inputs.");
      setOutput("");
      setMobileTab("output");
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError(null);
    setMobileTab("input");
  };

  // Generate parameters on load
  useEffect(() => {
    if (algo === "aes") {
      generateAesParameters();
    } else {
      generateRsaKeyPair();
    }
    handleClear();
  }, [algo]);

  return (
    <div className="space-y-6">
      {/* Algorithm Configuration Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
        <div className="flex items-center space-x-6">
          <div className="inline-flex rounded-lg border border-input p-0.5 bg-background">
            <button
              onClick={() => setAlgo("aes")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                algo === "aes"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              AES-GCM (Symmetric)
            </button>
            <button
              onClick={() => setAlgo("rsa")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                algo === "rsa"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              RSA-OAEP (Asymmetric)
            </button>
          </div>

          <div className="inline-flex rounded-lg border border-input p-0.5 bg-background">
            <button
              onClick={() => setMode("encrypt")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                mode === "encrypt"
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Encrypt
            </button>
            <button
              onClick={() => setMode("decrypt")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                mode === "decrypt"
                  ? "bg-secondary text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Decrypt
            </button>
          </div>
        </div>

        <div>
          {algo === "aes" ? (
            <Button variant="outline" size="sm" onClick={generateAesParameters}>
              Generate Key & IV
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={generateRsaKeyPair}>
              Generate Key Pair
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Tab Swapper */}
      <div className="lg:hidden flex rounded-lg border border-input p-0.5 bg-background">
        <button
          onClick={() => setMobileTab("input")}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            mobileTab === "input" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          {mode === "encrypt" ? "Message" : "Cipher"}
        </button>
        <button
          onClick={() => setMobileTab("keys")}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            mobileTab === "keys" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          Crypto Keys
        </button>
        <button
          onClick={() => setMobileTab("output")}
          disabled={!output && !error}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 ${
            mobileTab === "output" ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          Result
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Input text area */}
        <Card className={cn("flex flex-col h-[550px]", { "hidden lg:flex": mobileTab !== "input" })}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
            <span className="text-sm font-bold flex items-center">
              <Icon name="Terminal" className="w-4 h-4 mr-2 text-primary" />
              <span>{mode === "encrypt" ? "Plain Text Input" : "Hex Ciphertext Input"}</span>
            </span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleClear} title="Clear">
              <Icon name="Trash" className="w-4 h-4 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
          <CardContent className="flex-grow p-0">
            <Textarea
              placeholder={
                mode === "encrypt"
                  ? "Enter the secret string or payload text you want to encrypt securely..."
                  : "Enter the hexadecimal ciphertext representation you wish to decrypt..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              mono={mode === "decrypt"}
              className="w-full h-full border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 p-4 text-sm resize-none overflow-auto"
            />
          </CardContent>
          <div className="p-3 border-t border-border bg-muted/10 text-right">
            <Button size="sm" onClick={handleCryptoOperation} disabled={!input.trim()}>
              {mode === "encrypt" ? "Encrypt Payload" : "Decrypt Ciphertext"}
            </Button>
          </div>
        </Card>

        {/* Column 2: Cryptographic Keys (Secret Keys, Public/Private parameters) */}
        <Card className={cn("flex flex-col h-[550px]", { "hidden lg:flex": mobileTab !== "keys" })}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20 select-none">
            <span className="text-sm font-bold flex items-center">
              <Icon name="Key" className="w-4 h-4 mr-2 text-primary animate-pulse" />
              <span>Key Configuration</span>
            </span>
          </div>

          <CardContent className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
            {algo === "aes" ? (
              <div className="space-y-4 animate-fade-in">
                {/* AES Secret Key */}
                <div className="space-y-1">
                  <span className="font-semibold text-muted-foreground block">AES 256 Secret Key (Hex)</span>
                  <input
                    type="text"
                    value={aesKeyHex}
                    onChange={(e) => setAesKeyHex(e.target.value)}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 font-mono focus:outline-none"
                    placeholder="Enter or generate hex secret key..."
                  />
                </div>
                {/* AES IV */}
                <div className="space-y-1">
                  <span className="font-semibold text-muted-foreground block">Initialization Vector / IV (Hex)</span>
                  <input
                    type="text"
                    value={aesIvHex}
                    onChange={(e) => setAesIvHex(e.target.value)}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 font-mono focus:outline-none"
                    placeholder="Enter or generate hex IV..."
                  />
                </div>
                <div className="p-3 bg-secondary/20 rounded-lg text-[11px] text-muted-foreground leading-relaxed">
                  AES-GCM is a highly secure symmetric encryption method. Ensure you keep the Key and IV parameters consistent to decrypt successfully.
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {/* RSA Public Key (JWK) */}
                <div className="space-y-1">
                  <span className="font-semibold text-muted-foreground block">RSA Public Key (JWK format)</span>
                  <textarea
                    value={rsaPublicKeyJwk}
                    onChange={(e) => setRsaPublicKeyJwk(e.target.value)}
                    className="w-full h-36 rounded-lg border border-input bg-background p-2.5 font-mono text-[10px] resize-none focus:outline-none"
                    placeholder="Paste public JWK keys to encrypt..."
                  />
                </div>
                {/* RSA Private Key (JWK) */}
                <div className="space-y-1">
                  <span className="font-semibold text-muted-foreground block">RSA Private Key (JWK format)</span>
                  <textarea
                    value={rsaPrivateKeyJwk}
                    onChange={(e) => setRsaPrivateKeyJwk(e.target.value)}
                    className="w-full h-36 rounded-lg border border-input bg-background p-2.5 font-mono text-[10px] resize-none focus:outline-none"
                    placeholder="Paste private JWK keys to decrypt..."
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Column 3: Output Area */}
        <Card className={cn("flex flex-col h-[550px]", {
          "hidden lg:flex": mobileTab !== "output"
        })}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
            <span className="text-sm font-bold flex items-center">
              <Icon name="FileText" className="w-4 h-4 mr-2 text-primary" />
              <span>Result Output</span>
            </span>
            {output && (
              <Button variant="outline" size="sm" onClick={() => copy(output)} className="h-8 px-3">
                {isCopied ? (
                  <>
                    <Icon name="Check" className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    <span className="text-xs text-emerald-500 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Icon name="Copy" className="w-3.5 h-3.5 mr-1" />
                    <span className="text-xs">Copy</span>
                  </>
                )}
              </Button>
            )}
          </div>

          <CardContent className="flex-1 p-0 overflow-auto bg-card">
            {error ? (
              <div className="p-6 h-full flex flex-col justify-center bg-destructive/5 text-destructive space-y-3">
                <div className="flex items-center space-x-2.5">
                  <Icon name="AlertCircle" className="w-5 h-5 shrink-0" />
                  <h4 className="font-bold text-sm">Cryptographic Failure</h4>
                </div>
                <p className="text-xs bg-destructive/10 border border-destructive/20 rounded-lg p-4 font-mono leading-relaxed">
                  {error}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Make sure you have imported valid keys, standard hexadecimal ciphertexts, and matching parameters. RSA requires SHA-256 hashing.
                </p>
              </div>
            ) : (
              <pre className="p-4 font-mono text-xs overflow-auto h-full w-full select-text whitespace-pre bg-card text-foreground">
                {output || (
                  <span className="text-muted-foreground/60">
                    Results will render here upon successful encryption or decryption...
                  </span>
                )}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
