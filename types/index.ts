import { ReactNode } from "react";

export type ToolCategory =
  | "developers"
  | "formatters"
  | "encoders"
  | "generators"
  | "converters"
  | "utilities"
  | "ai";

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  href: string;
  icon: string; // Icon identifier for custom mapping
  keywords: string[];
  isPopular?: boolean;
  isFeatured?: boolean;
}

export interface CategoryInfo {
  id: ToolCategory;
  name: string;
  description: string;
  icon: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface HistoryItem {
  id: string;
  toolId: string;
  timestamp: number;
  label: string;
  input: string;
  output?: string;
}
