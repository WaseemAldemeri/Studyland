// src/components/ui/MultiSelectPopover.tsx

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type MultiSelectOption = {
  value: string;
  label: string;
};

interface MultiSelectPopoverProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onSelectionChange: (selected: string[]) => void;
  // NEW PROP: The name of the items being selected (e.g., "Topics")
  itemName: string;
  placeholder?: string;
  className?: string;
}

export function MultiSelectPopover({
  options,
  selectedValues,
  onSelectionChange,
  itemName,
  placeholder = "Select...",
  className,
}: MultiSelectPopoverProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onSelectionChange(newSelectedValues);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center gap-1">
            {/* --- UX IMPROVEMENT: Show summary instead of overflowing badges --- */}
            {selectedValues.length > 0 ? (
              <>
                <span className="font-semibold">{itemName}:</span>
                <span>{`${selectedValues.length} / ${options.length}`}</span>
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      
      {/* --- ANIMATION: Use AnimatePresence for smooth open/close --- */}
      <AnimatePresence>
        {isOpen && (
          <PopoverContent
            asChild // Allows us to use motion.div as the actual content element
            className="w-[--radix-popover-trigger-width] p-0"
            align="start"
          >
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.98 }}
              transition={{ duration: 0.1 }}
            >
              {/* --- STYLING FIX: Added background and text colors --- */}
              <Command className="bg-white text-popover-foreground">
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        onSelect={() => handleSelect(option.value)}
                        className="cursor-pointer hover:bg-primary/40"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedValues.includes(option.value)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </motion.div>
          </PopoverContent>
        )}
      </AnimatePresence>
    </Popover>
  );
}