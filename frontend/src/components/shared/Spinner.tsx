import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils/utils";

// Define the different sizes and their corresponding Tailwind classes
const spinnerVariants = cva(
  "animate-spin text-primary", // Base classes: animation and theme color
  {
    variants: {
      size: {
        default: "h-4 w-4",
        sm: "h-2 w-2",
        lg: "h-6 w-6",
        icon: "h-10 w-10"
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

// Define the props, extending the CVA variants
export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
}

// Create the component
export const Spinner = ({ className, size }: SpinnerProps) => {
  return (
    <Loader2 className={cn(spinnerVariants({ size }), className)} />
  );
};
