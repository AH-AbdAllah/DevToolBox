import Link from "next/link";
import { Icon } from "@/components/ui/icon";

const TOOL_LINKS = [
  { href: "/tools/json-formatter", label: "JSON Formatter" },
  { href: "/tools/base64-decoder", label: "Base64 Encoder/Decoder" },
  { href: "/tools/password-generator", label: "Password Generator" },
  { href: "/tools/jwt-decoder", label: "JWT Decoder" },
  { href: "/tools/error-translator", label: "AI Error Translator" },
  { href: "/tools/diff-checker", label: "Diff Checker" },
];

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card mt-auto">
      {/* Operational registry strip */}
      <div className="border-b border-border/50 px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4 font-mono text-[9px] tracking-widest text-muted-foreground/50 uppercase">
          <span className="flex items-center gap-1.5">
            <span className="status-dot status-dot-live" />
            PLATFORM ONLINE
          </span>
          <span className="cmd-separator" />
          <span>CLIENT-SIDE ARCHITECTURE</span>
          <span className="cmd-separator" />
          <span>ZERO SERVER LOGGING</span>
        </div>
        <span className="font-mono text-[9px] text-muted-foreground/40 tracking-widest uppercase hidden sm:block">
          v2.1.0 · 2026
        </span>
      </div>

      {/* Main footer content */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Identity block */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group/logo">
              <div className="relative">
                <div className="absolute inset-0 rounded bg-gradient-to-br from-primary to-emerald-400 blur-sm opacity-25 group-hover/logo:opacity-50 transition-opacity duration-200" />
                <div className="relative flex items-center justify-center w-7 h-7 rounded border border-border bg-card group-hover/logo:border-primary/40 transition-colors">
                  <svg className="w-3.5 h-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                    <line x1="14" y1="4" x2="10" y2="20" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-extrabold text-sm tracking-tight text-foreground">
                  Dev<span className="text-primary">ToolBox</span>
                </span>
                <span className="font-mono text-[8px] tracking-widest text-muted-foreground/50 uppercase">Command Center</span>
              </div>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              A high-precision developer intelligence platform. Client-side first, offline capable, cryptographically secure. Built for professional engineers.
            </p>
            <div className="flex items-center gap-2">
              <span className="signal-badge signal-badge-green">CLIENT-SIDE</span>
              <span className="signal-badge signal-badge-muted">OFFLINE OK</span>
            </div>
          </div>

          {/* Popular tools */}
          <div className="space-y-3">
            <h4 className="data-label text-foreground">Tool Registry</h4>
            <ul className="space-y-1.5">
              {TOOL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h4 className="data-label text-foreground">Navigation</h4>
            <ul className="space-y-1.5">
              {[
                { href: "/#catalog", label: "All Tools" },
                { href: "/#categories", label: "Categories" },
                { href: "/#faqs", label: "Platform Intel" },
              ].map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="text-xs text-muted-foreground hover:text-primary transition-colors font-mono hover:underline">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h4 className="data-label text-foreground">Platform</h4>
            <ul className="space-y-1.5">
              {["Privacy Policy", "Terms of Service", "Cookie Preferences"].map((item) => (
                <li key={item}>
                  <span className="text-xs text-muted-foreground/60 font-mono cursor-pointer hover:text-muted-foreground transition-colors">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
            <div className="pt-2 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/50">
                <Icon name="Shield" className="w-3 h-3" />
                <span>Zero server trace logging</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/50">
                <Icon name="Zap" className="w-3 h-3" />
                <span>Offline-capable PWA ready</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[10px] text-muted-foreground/50 tracking-wider">
            &copy; {new Date().getFullYear()} DevToolBox. All rights reserved. &nbsp;·&nbsp; Developer Intelligence Command Center
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              aria-label="GitHub"
            >
              <Icon name="Terminal" className="w-3.5 h-3.5" />
              <span className="hidden sm:inline uppercase tracking-widest">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
