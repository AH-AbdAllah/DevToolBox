import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card mt-auto">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo & Pitch */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-2.5 group/logo">
              <div className="relative">
                {/* Outer glowing backdrop */}
                <div className="absolute inset-0 rounded bg-gradient-to-tr from-primary to-indigo-500 blur-[2px] opacity-30 group-hover/logo:opacity-75 transition-opacity duration-300" />
                {/* Inner icon canvas */}
                <div className="relative flex items-center justify-center w-7.5 h-7.5 rounded bg-card border border-border group-hover/logo:border-primary/50 transition-colors duration-300 shadow-sm">
                  {/* Glowing core code block SVG */}
                  <svg
                    className="w-3.5 h-3.5 text-primary group-hover/logo:scale-110 group-hover/logo:rotate-3 transition-transform duration-300"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                    <line x1="14" y1="4" x2="10" y2="20" className="text-indigo-400/80" />
                  </svg>
                </div>
              </div>
              <span className="font-extrabold text-base tracking-tight text-foreground">
                Dev<span className="text-primary group-hover/logo:text-indigo-400 transition-colors duration-200">ToolBox</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              DevToolBox provides essential, client-side first utilities for developers, students, and engineers. Secure, offline-capable, and optimized for performance.
            </p>
          </div>

          {/* Tools Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Popular Tools</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/tools/json-formatter" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  JSON Formatter
                </Link>
              </li>
              <li>
                <Link href="/tools/base64-decoder" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Base64 Encoder/Decoder
                </Link>
              </li>
              <li>
                <Link href="/tools/password-generator" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Password Generator
                </Link>
              </li>
              <li>
                <Link href="/tools/jwt-decoder" className="text-xs text-muted-foreground hover:text-foreground/80 transition-colors opacity-60">
                  JWT Decoder (Soon)
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Features</h4>
            <ul className="space-y-2">
              <li>
                <a href="#categories" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Categories
                </a>
              </li>
              <li>
                <a href="#faqs" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">Policies</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  Cookie Preferences
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} DevToolBox. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
              <span className="sr-only">GitHub</span>
              <Icon name="Terminal" className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
