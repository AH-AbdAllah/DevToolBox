import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, checked, onChange, ...props }, ref) => {
    return (
      <label className="inline-flex items-center justify-between w-full cursor-pointer select-none py-1">
        {label && <span className="text-sm font-medium text-foreground">{label}</span>}
        <div className="relative">
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            ref={ref}
            className="sr-only peer"
            {...props}
          />
          <div className="w-10 h-6 bg-secondary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-2 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary transition-colors duration-200"></div>
        </div>
      </label>
    );
  }
);
Switch.displayName = "Switch";
