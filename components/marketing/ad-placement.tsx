"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";

interface AdPlacementProps {
  slot: "sidebar" | "banner-top" | "banner-bottom" | "in-tool";
  className?: string;
}

export function AdPlacement({ slot, className }: AdPlacementProps) {
  const [isAdBlockEnabled, setIsAdBlockEnabled] = useState(false);

  useEffect(() => {
    // Monetization check placeholder
    // In production, we can append AdSense / Carbon scripts here.
  }, []);

  // Dimensions based on slot
  const dimensions = {
    sidebar: "min-h-[250px] w-full max-w-[300px]",
    "banner-top": "min-h-[90px] w-full max-w-7xl mx-auto my-4",
    "banner-bottom": "min-h-[90px] w-full max-w-7xl mx-auto my-6",
    "in-tool": "min-h-[100px] w-full mt-6",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-border/50 bg-secondary/10 flex flex-col items-center justify-center p-4 text-center select-none ${dimensions[slot]} ${className}`}
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center space-y-1.5 max-w-xs">
        <div className="inline-flex items-center space-x-1 text-[9px] font-semibold text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border uppercase tracking-widest">
          <span>Sponsor / Advertisement</span>
        </div>
        <Icon name="Compass" className="w-5 h-5 text-muted-foreground/30 animate-pulse" />
        <p className="text-[11px] font-medium text-muted-foreground/80 leading-snug">
          Support DevToolBox hosting by purchasing a premium license or sponsoring a slot.
        </p>
        <span className="text-[10px] text-primary hover:underline cursor-pointer font-semibold">
          Advertise here &rarr;
        </span>
      </div>
    </div>
  );
}
