"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

export function PremiumBanner() {
  const benefits = [
    { text: "100% Ad-Free interface for focused work", free: false, pro: true },
    { text: "Unlimited bulk/batch execution (e.g. bulk UUIDs)", free: "Up to 10", pro: "Unlimited" },
    { text: "Persistent history log synced across devices", free: "Local (24h)", pro: "Cloud (Unlimited)" },
    { text: "Custom API access key pipelines", free: false, pro: true },
    { text: "Priority developer features & direct support", free: false, pro: true },
  ];

  return (
    <section id="premium" className="py-20 relative overflow-hidden border-t border-border bg-background">
      {/* Background radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-primary">
            Supercharge Your Workflow
          </h2>
          <p className="text-base text-muted-foreground">
            Unlock additional batch capabilities, zero distractions, and cloud synchronization with our premium plan.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <Card className="flex flex-col justify-between border-border bg-card relative">
            <div>
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                  <span>Standard</span>
                  <span className="text-xs font-normal bg-secondary px-2.5 py-1 rounded-full text-muted-foreground">Active</span>
                </CardTitle>
                <CardDescription>Essential client-side developer tools.</CardDescription>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold tracking-tight">$0</span>
                  <span className="ml-1 text-sm text-muted-foreground">/ forever</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-t border-border/50 pt-4" />
                <ul className="space-y-3">
                  {benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start text-sm">
                      {benefit.free ? (
                        <Icon name="Check" className="w-4 h-4 text-emerald-500 mr-3 mt-0.5 shrink-0" />
                      ) : (
                        <Icon name="X" className="w-4 h-4 text-muted-foreground/45 mr-3 mt-0.5 shrink-0" />
                      )}
                      <span className={benefit.free ? "text-foreground" : "text-muted-foreground/60"}>
                        {benefit.text} {typeof benefit.free === "string" && `(${benefit.free})`}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </div>
            <CardFooter>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Tier */}
          <Card className="flex flex-col justify-between border-primary/50 bg-card/65 shadow-lg shadow-primary/5 relative scale-102 md:scale-105 ring-2 ring-primary/20">
            {/* Pop badge */}
            <div className="absolute top-0 right-6 -translate-y-1/2">
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-gradient-to-r from-primary to-indigo-600 text-xs font-bold text-primary-foreground shadow-md">
                <Icon name="Sparkles" className="w-3.5 h-3.5" />
                <span>Recommended</span>
              </span>
            </div>

            <div>
              <CardHeader>
                <CardTitle className="text-xl font-bold">Pro / Premium</CardTitle>
                <CardDescription>Power-user platform extensions.</CardDescription>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">$5</span>
                  <span className="ml-1 text-sm text-muted-foreground">/ month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-t border-border/50 pt-4" />
                <ul className="space-y-3">
                  {benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <Icon name="Check" className="w-4 h-4 text-primary mr-3 mt-0.5 shrink-0" />
                      <span className="text-foreground">
                        {benefit.text} {typeof benefit.pro === "string" && `(${benefit.pro})`}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </div>
            <CardFooter>
              <Button className="w-full bg-gradient-to-r from-primary to-indigo-600 border-0 text-white shadow-md hover:opacity-90">
                Upgrade to Pro (Soon)
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
