"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";

interface SubnetResult {
  ip: string;
  cidr: number;
  netmask: string;
  wildcard: string;
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  usableHosts: number;
  ipClass: string;
  ipBinary: string;
  maskBinary: string;
}

export function SubnetCalculatorClient() {
  const [ipInput, setIpInput] = useState("192.168.1.1");
  const [cidrInput, setCidrInput] = useState(24);
  const [result, setResult] = useState<SubnetResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isCopied, copy } = useCopyToClipboard();

  // Helper: Convert integer to dotted decimal IP string
  const intToIp = (num: number): string => {
    return [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255,
    ].join(".");
  };

  // Helper: Convert IP string to 32-bit unsigned integer
  const ipToInt = (ipStr: string): number => {
    const octets = ipStr.split(".").map((o) => parseInt(o, 10));
    return (octets[0] << 24) + (octets[1] << 16) + (octets[2] << 8) + octets[3];
  };

  // Helper: Convert integer to 32-bit binary string with dot separations
  const intToBinaryString = (num: number): string => {
    const rawBinary = (num >>> 0).toString(2).padStart(32, "0");
    return [
      rawBinary.substring(0, 8),
      rawBinary.substring(8, 16),
      rawBinary.substring(16, 24),
      rawBinary.substring(24, 32),
    ].join(".");
  };

  const calculateSubnet = () => {
    // Validate IP syntax
    const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipPattern.test(ipInput.trim())) {
      setError("Invalid IPv4 address format. Expects 4 octets between 0 and 255.");
      setResult(null);
      return;
    }

    if (cidrInput < 1 || cidrInput > 32) {
      setError("CIDR Prefix must be a value between 1 and 32.");
      setResult(null);
      return;
    }

    try {
      const ipNum = ipToInt(ipInput.trim()) >>> 0;
      
      // Calculate netmask integer: cidr length bits of ones, shifted
      const maskNum = (cidrInput === 32 ? 0xffffffff : ~(0xffffffff >>> cidrInput)) >>> 0;
      const wildcardNum = (~maskNum) >>> 0;

      const networkNum = (ipNum & maskNum) >>> 0;
      const broadcastNum = (ipNum | wildcardNum) >>> 0;

      // Handle host counts and bounds based on CIDR edge cases (RFC 3021 / 32)
      let firstHostNum = 0;
      let lastHostNum = 0;
      let usableCount = 0;

      if (cidrInput === 32) {
        firstHostNum = ipNum;
        lastHostNum = ipNum;
        usableCount = 1;
      } else if (cidrInput === 31) {
        firstHostNum = networkNum;
        lastHostNum = broadcastNum;
        usableCount = 2;
      } else {
        firstHostNum = networkNum + 1;
        lastHostNum = broadcastNum - 1;
        usableCount = Math.max(0, Math.pow(2, 32 - cidrInput) - 2);
      }

      // Determine IP class based on first octet
      const firstOctet = (ipNum >>> 24) & 255;
      let ipClass = "C";
      if (firstOctet < 128) ipClass = "A";
      else if (firstOctet < 192) ipClass = "B";
      else if (firstOctet < 224) ipClass = "C";
      else if (firstOctet < 240) ipClass = "D (Multicast)";
      else ipClass = "E (Experimental)";

      setResult({
        ip: ipInput.trim(),
        cidr: cidrInput,
        netmask: intToIp(maskNum),
        wildcard: intToIp(wildcardNum),
        network: intToIp(networkNum),
        broadcast: intToIp(broadcastNum),
        firstHost: intToIp(firstHostNum),
        lastHost: intToIp(lastHostNum),
        usableHosts: usableCount,
        ipClass,
        ipBinary: intToBinaryString(ipNum),
        maskBinary: intToBinaryString(maskNum),
      });
      setError(null);
    } catch (err) {
      setError("Calculation failed due to parsing exception.");
      setResult(null);
    }
  };

  useEffect(() => {
    calculateSubnet();
  }, [ipInput, cidrInput]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Settings Input Card (takes 1 col on desktop) */}
      <Card className="lg:col-span-1 border-border h-fit">
        <CardContent className="p-6 space-y-5">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            Subnet Input
          </h3>
          <div className="border-t border-border/50" />

          {/* IP Input */}
          <div className="space-y-1 text-xs">
            <span className="font-semibold text-muted-foreground block">IP Address</span>
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              className="w-full h-10 rounded-lg border border-input bg-background px-3 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="e.g. 192.168.1.1"
            />
          </div>

          {/* CIDR Prefix */}
          <div className="space-y-1 text-xs">
            <span className="font-semibold text-muted-foreground block">CIDR Prefix / Prefix Mask</span>
            <select
              value={cidrInput}
              onChange={(e) => setCidrInput(parseInt(e.target.value, 10))}
              className="w-full h-10 rounded-lg border border-input bg-background px-3 font-mono focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {Array.from({ length: 32 }, (_, i) => 32 - i).map((prefix) => {
                // Approximate network size
                const hosts = prefix === 32 ? 1 : prefix === 31 ? 2 : Math.max(0, Math.pow(2, 32 - prefix) - 2);
                return (
                  <option key={prefix} value={prefix}>
                    /{prefix} (Hosts: {hosts.toLocaleString()})
                  </option>
                );
              })}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results grid (takes 2 cols on desktop) */}
      <div className="lg:col-span-2 space-y-6">
        {error ? (
          <Card className="border-destructive/30 bg-destructive/5 p-6 text-center text-destructive">
            <CardContent className="space-y-2">
              <Icon name="AlertCircle" className="w-8 h-8 text-destructive mx-auto animate-pulse" />
              <h4 className="font-bold">Input Error</h4>
              <p className="text-xs font-mono">{error}</p>
            </CardContent>
          </Card>
        ) : result ? (
          <div className="space-y-6 animate-fade-in">
            {/* Numeric calculations table */}
            <Card className="border-border overflow-hidden">
              <div className="px-5 py-3 border-b border-border bg-muted/10 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                Network Calculations
              </div>
              <CardContent className="p-0 text-xs">
                <table className="min-w-full divide-y divide-border border-collapse">
                  <tbody className="divide-y divide-border/60">
                    {[
                      { label: "Network Address", val: result.network, icon: "Terminal" },
                      { label: "Broadcast Address", val: result.broadcast, icon: "Compass" },
                      { label: "Usable Host Range", val: `${result.firstHost} - ${result.lastHost}`, icon: "Shuffle" },
                      { label: "Total Usable Hosts", val: result.usableHosts.toLocaleString(), icon: "Cpu" },
                      { label: "Subnet Mask", val: result.netmask, icon: "Key" },
                      { label: "Wildcard Mask", val: result.wildcard, icon: "Binary" },
                      { label: "IP Class / Prefix", val: `Class ${result.ipClass}`, icon: "Info" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-muted/10 transition-colors">
                        <td className="px-5 py-3 text-muted-foreground font-semibold flex items-center">
                          <Icon name={row.icon} className="w-3.5 h-3.5 mr-2 text-primary" />
                          <span>{row.label}</span>
                        </td>
                        <td className="px-5 py-3 font-mono font-bold text-foreground select-all text-right">
                          {row.val}
                        </td>
                        <td className="px-5 py-3 text-right w-12">
                          <button
                            onClick={() => copy(row.val)}
                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                            title="Copy parameter"
                          >
                            <Icon name="Copy" className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Binary Bit Visualizer (The high-end UX feature) */}
            <Card className="border-border">
              <div className="px-5 py-3 border-b border-border bg-muted/10 font-bold text-xs uppercase tracking-wider text-muted-foreground select-none">
                Binary Bit Representation
              </div>
              <CardContent className="p-6 space-y-4 font-mono text-xs">
                <div className="space-y-4">
                  {/* IP Address Row */}
                  <div className="space-y-2">
                    <span className="text-muted-foreground font-semibold text-[10px] uppercase tracking-wider block">
                      IP Address Binary Notation ({result.ip})
                    </span>
                    <BinaryGrid binaryString={result.ipBinary} cidr={result.cidr} />
                  </div>

                  {/* Mask Row */}
                  <div className="space-y-2 border-t border-border/40 pt-4">
                    <span className="text-muted-foreground font-semibold text-[10px] uppercase tracking-wider block">
                      Subnet Mask Binary Notation ({result.netmask})
                    </span>
                    <BinaryGrid binaryString={result.maskBinary} cidr={result.cidr} />
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-[10px] pt-2 border-t border-border/40 select-none">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-primary" />
                    <span className="font-bold text-foreground">Network Bits ({result.cidr})</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3.5 h-3.5 rounded bg-sky-400" />
                    <span className="font-bold text-foreground">Host Bits ({32 - result.cidr})</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Binary bits renderer helper
function BinaryGrid({ binaryString, cidr }: { binaryString: string; cidr: number }) {
  // Split bits by dot octets
  const octets = binaryString.split(".");
  let absoluteBitIndex = 0;

  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
      {octets.map((octet, octetIdx) => (
        <div key={octetIdx} className="flex items-center space-x-0.5">
          {octet.split("").map((bit, bitIdx) => {
            absoluteBitIndex++;
            const isNetworkBit = absoluteBitIndex <= cidr;
            return (
              <span
                key={bitIdx}
                className={cn(
                  "w-6 h-7 rounded flex items-center justify-center font-bold text-xs select-none transition-all shadow-sm border border-black/5",
                  isNetworkBit
                    ? "bg-primary text-primary-foreground"
                    : "bg-sky-400 text-sky-950"
                )}
              >
                {bit}
              </span>
            );
          })}
          {octetIdx < 3 && (
            <span className="font-bold text-foreground/45 text-base px-0.5 select-none">.</span>
          )}
        </div>
      ))}
    </div>
  );
}
