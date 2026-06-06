import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card mt-auto">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo & Pitch */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-6 h-6 rounded bg-gradient-to-tr from-primary to-indigo-500 shadow-sm">
                <Icon name="Cpu" className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold text-base bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground">
                DevToolBox
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
              <li>
                <a href="#premium" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Premium Version
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
