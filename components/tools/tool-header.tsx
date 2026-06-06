import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { ToolCategory } from "@/types";

interface ToolHeaderProps {
  title: string;
  description: string;
  category: ToolCategory;
}

const categoryLabels: Record<ToolCategory, string> = {
  formatters: "Formatter & Validator",
  encoders: "Encoder / Decoder",
  generators: "Generator",
  converters: "Converter",
  developers: "Developer Utility",
  utilities: "Utility",
};

export function ToolHeader({ title, description, category }: ToolHeaderProps) {
  return (
    <div className="flex flex-col space-y-3 mb-6">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <Icon name="ChevronRight" className="w-3 h-3" />
        <span className="capitalize">{category}</span>
        <Icon name="ChevronRight" className="w-3 h-3" />
        <span className="text-foreground font-medium">{title}</span>
      </div>

      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary">
            {categoryLabels[category]}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
