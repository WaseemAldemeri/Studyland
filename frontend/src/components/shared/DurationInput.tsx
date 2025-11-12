import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn, formatDuration, parseDuration } from "@/lib/utils/utils";


type DurationInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  value: string; // Expects "HH:mm"
  onChange: (value: string) => void;
}

export const DurationInput = React.forwardRef<HTMLInputElement, DurationInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    
    const handleStep = (amount: number) => {
      const currentMinutes = parseDuration(value);
      const newMinutes = currentMinutes + amount;
      onChange(formatDuration(newMinutes));
    };

    return (
      <div className="relative">
        <Input
          className={cn("pr-12", className)} // Add padding to make space for the buttons
          value={value}
          onChange={(e) => onChange(e.target.value)} // Allow direct typing
          ref={ref}
          {...props}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col h-full justify-center">
          <Button
            type="button" // Prevent form submission
            variant="ghost"
            size="icon"
            className="h-1/2 w-8 rounded-none rounded-tr-md"
            onClick={() => handleStep(15)} // Increment by 15 minutes
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-1/2 w-8 rounded-none rounded-br-md"
            onClick={() => handleStep(-15)} // Decrement by 15 minutes
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
);
DurationInput.displayName = "DurationInput";