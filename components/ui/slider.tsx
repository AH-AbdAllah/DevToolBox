import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  value: number;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, value, min = 0, max = 100, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-2 w-full">
        {label && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
            <span className="text-sm font-mono font-semibold bg-accent text-accent-foreground px-2 py-0.5 rounded">
              {value}
            </span>
          </div>
        )}
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          ref={ref}
          className={cn(
            "w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Slider.displayName = "Slider";
