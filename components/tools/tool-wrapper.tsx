import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { TOOLS } from "@/lib/tools-data";
import { ToolCategory } from "@/types";
import { AdPlacement } from "@/components/marketing/ad-placement";

interface ToolWrapperProps {
  children: React.ReactNode;
  currentToolId: string;
  currentCategory: ToolCategory;
  instructions: { title: string; steps: string[] };
}

export function ToolWrapper({ children, currentToolId, currentCategory, instructions }: ToolWrapperProps) {
  // Find related tools (same category, excluding current)
  const relatedTools = TOOLS.filter(
    (tool) => tool.category === currentCategory && tool.id !== currentToolId
  ).slice(0, 4);

  // Fallback to other popular tools if none in same category
  const fallbackTools = relatedTools.length > 0 
    ? relatedTools 
    : TOOLS.filter((tool) => tool.id !== currentToolId).slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Main Content Workspace */}
      <div className="lg:col-span-3 space-y-8">
        <div className="min-w-0">{children}</div>

        {/* Dynamic usage instructions */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-lg font-bold flex items-center space-x-2">
            <Icon name="Info" className="w-5 h-5 text-primary" />
            <span>How to Use {instructions.title}</span>
          </h3>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-muted-foreground">
            {instructions.steps.map((step, index) => (
              <li key={index} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Sidebar (Navigation, Ads) */}
      <div className="lg:col-span-1 space-y-6">
        {/* Ad block */}
        <AdPlacement slot="sidebar" />

        {/* Related tools */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center space-x-2">
            <Icon name="Shuffle" className="w-4 h-4 text-primary" />
            <span>Related Tools</span>
          </h3>
          <div className="border-t border-border/50" />
          <nav className="space-y-1">
            {fallbackTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.href}
                className="flex items-start p-2 rounded-lg hover:bg-muted transition-colors text-sm text-muted-foreground hover:text-foreground group"
              >
                <Icon
                  name={tool.icon}
                  className="w-4 h-4 mr-2.5 mt-0.5 group-hover:text-primary transition-colors text-muted-foreground/75"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                    {tool.name}
                  </div>
                  <div className="text-xs truncate text-muted-foreground/85">
                    {tool.description}
                  </div>
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* Security disclaimer */}
        <div className="rounded-xl border border-border/50 bg-secondary/5 p-4 space-y-2">
          <h4 className="text-xs font-bold flex items-center text-foreground">
            <Icon name="Lock" className="w-3.5 h-3.5 text-emerald-500 mr-2" />
            <span>Secure & Private</span>
          </h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            All operations are executed on your device using Client-Side JavaScript. No data is sent to external servers. Your credentials and code are safe.
          </p>
        </div>
      </div>
    </div>
  );
}
