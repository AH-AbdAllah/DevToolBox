"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { Card, CardContent } from "@/components/ui/card";
import { TOOLS, CATEGORIES, FAQS } from "@/lib/tools-data";
import { ToolCategory } from "@/types";

export function HomePageClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | "all">("all");

  // Filter tools based on search query and category selector
  const filteredTools = TOOLS.filter((tool) => {
    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.keywords.some((kw) => kw.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Check if a tool is built or placeholder
  const isToolImplemented = (id: string) => {
    return ["json-formatter", "base64-decoder", "password-generator"].includes(id);
  };

  return (
    <div className="flex-1 space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-card to-background border-b border-border">
        {/* Background Dot Pattern & Radial Accent */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <Icon name="Sparkles" className="w-3.5 h-3.5" />
            <span>100% Client-Side & Secure</span>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-primary">
              All the tools you need.
              <br />
              <span className="text-primary">None of the bloat.</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              DevToolBox provides ultra-fast, security-first offline web utilities for developers, students, and engineers. Zero trackers. Zero data retention.
            </p>
          </div>

          {/* Hero Search Bar */}
          <div className="max-w-md mx-auto relative">
            <div className="flex items-center px-4 border border-input rounded-xl bg-card shadow-lg focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all duration-200">
              <Icon name="Search" className="w-5 h-5 text-muted-foreground mr-3" />
              <input
                type="text"
                placeholder="Search JSON formatter, passwords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 bg-transparent text-foreground placeholder:text-muted-foreground text-sm focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon name="X" className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="mt-2.5 text-xs text-muted-foreground">
              Tip: Press <kbd className="px-1.5 py-0.5 font-semibold bg-muted border border-border rounded">⌘K</kbd> anywhere to search.
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog View */}
      <section id="catalog" className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Tool Catalog</h2>
            <p className="text-sm text-muted-foreground">
              Filter by category or find what you need instantly.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 max-w-full overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-primary border-primary text-primary-foreground shadow"
                  : "border-input bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              All Tools
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1.5 cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-primary border-primary text-primary-foreground shadow"
                    : "border-input bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => {
              const active = isToolImplemented(tool.id);
              return (
                <div
                  key={tool.id}
                  className={`group relative rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 ${
                    active ? "hover:-translate-y-1 border-primary/20 hover:border-primary/50" : "opacity-75"
                  }`}
                >
                  {/* Grid card content wrapper */}
                  <div className="p-6 flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors shadow-sm">
                          <Icon name={tool.icon} className="w-5 h-5" />
                        </div>
                        {tool.isPopular && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                        {!active && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                            Soon
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    <div>
                      {active ? (
                        <Link
                          href={tool.href}
                          className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
                        >
                          <span>Open Tool</span>
                          <Icon name="ArrowRight" className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium flex items-center">
                          <Icon name="Lock" className="w-3 h-3 mr-1" /> Ready soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card className="text-center p-12 max-w-md mx-auto">
            <CardContent className="space-y-4 flex flex-col items-center">
              <Icon name="Info" className="w-10 h-10 text-muted-foreground/35" />
              <h3 className="text-lg font-bold">No tools found</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We couldn't find any tool matching your search or filters. Try search keywords like "json", "base64", or "password".
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Category Info Grid */}
      <section className="bg-secondary/20 py-20 border-y border-border">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              Built for Multiple Categories
            </h2>
            <p className="text-sm text-muted-foreground">
              A comprehensive utility suite categorized to fit different development and academic workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((category) => (
              <div
                key={category.id}
                onClick={() => {
                  setSelectedCategory(category.id);
                  const catalogElement = document.getElementById("catalog");
                  catalogElement?.scrollIntoView({ behavior: "smooth" });
                }}
                className="p-6 rounded-xl border border-border bg-card shadow-sm hover:border-primary/40 transition-colors cursor-pointer space-y-3 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                    <Icon name={category.icon} className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faqs" className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-12 scroll-mt-20">
        <div className="text-center space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-muted-foreground">
            Everything you need to know about safety, pricing, and how the platform operates.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div
              key={index}
              className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-2"
            >
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                {faq.question}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
