import {
  Braces,
  Key,
  Cpu,
  Shuffle,
  Terminal,
  FileText,
  Lock,
  ShieldAlert,
  Binary,
  Fingerprint,
  Clock,
  Palette,
  Hash,
  Compass,
  Copy,
  Check,
  Trash2,
  Download,
  Upload,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  ChevronRight,
  Info,
  ExternalLink,
  History,
  Settings,
  AlertCircle,
  ArrowRight,
  Sparkles,
  LucideProps,
} from "lucide-react";

export type IconName =
  | "Braces"
  | "Key"
  | "Cpu"
  | "Shuffle"
  | "Terminal"
  | "FileText"
  | "Lock"
  | "ShieldAlert"
  | "Binary"
  | "Fingerprint"
  | "Clock"
  | "Palette"
  | "Hash"
  | "Compass"
  | "Copy"
  | "Check"
  | "Trash"
  | "Download"
  | "Upload"
  | "Search"
  | "Moon"
  | "Sun"
  | "Menu"
  | "X"
  | "ChevronRight"
  | "Info"
  | "ExternalLink"
  | "History"
  | "Settings"
  | "AlertCircle"
  | "ArrowRight"
  | "Sparkles";

const iconMap: Record<IconName, React.ComponentType<LucideProps>> = {
  Braces,
  Key,
  Cpu,
  Shuffle,
  Terminal,
  FileText,
  Lock,
  ShieldAlert,
  Binary,
  Fingerprint,
  Clock,
  Palette,
  Hash,
  Compass,
  Copy,
  Check,
  Trash: Trash2,
  Download,
  Upload,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  ChevronRight,
  Info,
  ExternalLink,
  History,
  Settings,
  AlertCircle,
  ArrowRight,
  Sparkles,
};

interface IconProps extends Omit<LucideProps, "ref"> {
  name: string;
}

export function Icon({ name, ...props }: IconProps) {
  const IconComponent = iconMap[name as IconName] || Terminal;
  return <IconComponent {...props} />;
}
