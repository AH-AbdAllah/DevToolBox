"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";

const SAMPLE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoyNTUxNjIzOTAyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

export function JwtDecoderClient() {
  const [token, setToken] = useState("");
  const [headerJson, setHeaderJson] = useState<any>(null);
  const [payloadJson, setPayloadJson] = useState<any>(null);
  const [signatureStr, setSignatureStr] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"input" | "decoded">("input");

  // Helper: Unicode-safe base64url decoding
  const base64UrlDecode = (str: string) => {
    try {
      // Replace URL-safe chars and add padding
      let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4) {
        base64 += "=";
      }
      const raw = window.atob(base64);
      // UTF-8 decoding
      const utf8 = raw
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("");
      return decodeURIComponent(utf8);
    } catch {
      throw new Error("Invalid base64 encoding");
    }
  };

  const handleDecode = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      setHeaderJson(null);
      setPayloadJson(null);
      setSignatureStr("");
      setErrorMsg(null);
      return;
    }

    const parts = trimmed.split(".");
    if (parts.length !== 3) {
      setErrorMsg("Invalid token: A JWT must contain exactly 3 dot-separated segments (Header, Payload, Signature).");
      setHeaderJson(null);
      setPayloadJson(null);
      setSignatureStr("");
      return;
    }

    try {
      const decodedHeader = JSON.parse(base64UrlDecode(parts[0]));
      const decodedPayload = JSON.parse(base64UrlDecode(parts[1]));
      setHeaderJson(decodedHeader);
      setPayloadJson(decodedPayload);
      setSignatureStr(parts[2]);
      setErrorMsg(null);
    } catch {
      setErrorMsg("Failed to decode token. Ensure the input string is a valid base64url-encoded JSON Web Token.");
      setHeaderJson(null);
      setPayloadJson(null);
      setSignatureStr("");
    }
  };

  useEffect(() => {
    handleDecode(token);
  }, [token]);

  // Load sandbox transfer inputs on mount
  useEffect(() => {
    const transfer = sessionStorage.getItem("sandbox_transfer_input");
    if (transfer) {
      setToken(transfer);
      setMobileTab("decoded");
      sessionStorage.removeItem("sandbox_transfer_input");
    }
  }, []);

  const loadSample = () => {
    setToken(SAMPLE_JWT);
    setMobileTab("decoded");
  };

  const handleClear = () => {
    setToken("");
    setMobileTab("input");
  };

  // Helper: Format unix timestamp to human date
  const formatUnixDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  // Helper: Check if token is expired based on exp claim
  const checkExpiryStatus = (exp?: number) => {
    if (!exp) return { label: "No expiry set", color: "text-muted-foreground bg-muted" };
    const current = Math.floor(Date.now() / 1000);
    if (exp < current) {
      return { label: "Expired", color: "text-destructive bg-destructive/10 border border-destructive/20" };
    }
    return { label: "Active", color: "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20" };
  };

  return (
    <div className="space-y-6">
      {/* Mobile Tab Swapper */}
      <div className="lg:hidden flex rounded-lg border border-input p-0.5 bg-background">
        <button
          onClick={() => setMobileTab("input")}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            mobileTab === "input"
              ? "bg-secondary text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Token Input
        </button>
        <button
          onClick={() => setMobileTab("decoded")}
          className={`flex-1 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
            mobileTab === "decoded"
              ? "bg-secondary text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Decoded Claims {payloadJson ? "•" : ""}
        </button>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Input Editor */}
        <div className={`lg:col-span-2 ${mobileTab !== "input" ? "hidden lg:block" : ""}`}>
          <Card className="h-full min-h-[400px] flex flex-col justify-between border-border">
            <div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center">
                  <Icon name="Key" className="w-4 h-4 mr-2 text-primary" />
                  <span>Encoded JWT</span>
                </span>
                <div className="flex items-center space-x-1.5">
                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={loadSample}>
                    Sample
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleClear} title="Clear">
                    <Icon name="Trash" className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-4">
                <Textarea
                  placeholder="Paste your base64-encoded JWT token here..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  mono
                  className="h-72 text-xs font-mono break-all focus-visible:ring-1"
                />
              </CardContent>
            </div>
            {errorMsg && (
              <div className="mx-4 mb-4 p-4 border border-destructive/20 bg-destructive/5 text-destructive rounded-lg text-xs leading-relaxed font-mono">
                {errorMsg}
              </div>
            )}
          </Card>
        </div>

        {/* Right Output Panels */}
        <div className={`lg:col-span-3 ${mobileTab !== "decoded" ? "hidden lg:block" : ""} space-y-6`}>
          {payloadJson ? (
            <>
              {/* Claims summary card */}
              <div className="p-4 rounded-xl border border-border bg-card grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <div className="text-muted-foreground font-semibold">Subject (sub)</div>
                  <div className="font-mono text-foreground">{payloadJson.sub || "N/A"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground font-semibold">Issuer (iss)</div>
                  <div className="font-mono text-foreground">{payloadJson.iss || "N/A"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground font-semibold">Expiration (exp)</div>
                  <div className="font-mono flex items-center space-x-2">
                    <span>{formatUnixDate(payloadJson.exp)}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${checkExpiryStatus(payloadJson.exp).color}`}>
                      {checkExpiryStatus(payloadJson.exp).label}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground font-semibold">Issued At (iat)</div>
                  <div className="font-mono text-foreground">{formatUnixDate(payloadJson.iat)}</div>
                </div>
              </div>

              {/* Decoded Header */}
              <Card className="border-border/60">
                <div className="px-4 py-2 border-b border-border bg-rose-500/5 text-rose-500 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>Header: Algorithm & Token Type</span>
                  <span className="text-[10px] bg-rose-500/10 px-2 py-0.5 rounded">JSON</span>
                </div>
                <CardContent className="p-4 bg-muted/5">
                  <pre className="text-xs font-mono text-foreground overflow-auto whitespace-pre-wrap select-all">
                    {JSON.stringify(headerJson, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              {/* Decoded Payload */}
              <Card className="border-border/60">
                <div className="px-4 py-2 border-b border-border bg-sky-500/5 text-sky-500 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>Payload: User Data & Claims</span>
                  <span className="text-[10px] bg-sky-500/10 px-2 py-0.5 rounded">JSON</span>
                </div>
                <CardContent className="p-4 bg-muted/5">
                  <pre className="text-xs font-mono text-foreground overflow-auto whitespace-pre-wrap select-all">
                    {JSON.stringify(payloadJson, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              {/* Signature display */}
              <Card className="border-border/60">
                <div className="px-4 py-2 border-b border-border bg-emerald-500/5 text-emerald-500 text-xs font-bold uppercase tracking-wider">
                  Signature Hash
                </div>
                <CardContent className="p-4 bg-muted/5">
                  <div className="text-xs font-mono text-muted-foreground break-all select-all leading-relaxed bg-background/50 p-2.5 rounded border border-border/40">
                    {signatureStr || "HMACSHA256(base64UrlHeader + '.' + base64UrlPayload, secrets)"}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 rounded-xl border border-border bg-card space-y-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground/40">
                <Icon name="Braces" className="w-5 h-5" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h4 className="text-sm font-bold">No Encoded JWT Provided</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enter an encoded JWT string in the input card to inspect claims, headers, and expiry configurations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
