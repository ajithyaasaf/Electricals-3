import { useState, useMemo } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { State } from 'country-state-city';

interface StateSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function StateSelector({
  value,
  onValueChange,
  placeholder = "Select state...",
  disabled = false,
  className,
}: StateSelectorProps) {
  const [open, setOpen] = useState(false);

  // Get all states for India (IN) and filter out Andaman and Nicobar Islands (AN)
  // All states except Tamil Nadu (TN) will be disabled/blurred
  const indianStates = useMemo(() => {
    return State.getStatesOfCountry('IN').filter(state => state.isoCode !== 'AN');
  }, []);

  const selectedState = useMemo(
    () => indianStates.find((state) => state.isoCode === value),
    [value, indianStates]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
            className
          )}
          data-testid="button-state-selector"
        >
          {selectedState ? selectedState.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search state..."
            data-testid="input-state-search"
          />
          <CommandList>
            <CommandEmpty>No state found.</CommandEmpty>
            <CommandGroup>
              {indianStates.map((state) => (
                <CommandItem
                  key={state.isoCode}
                  value={state.name}
                  disabled={state.isoCode !== 'TN'}
                  onSelect={() => {
                    if (state.isoCode === 'TN') {
                      onValueChange(state.isoCode);
                      setOpen(false);
                    }
                  }}
                  className={cn(
                    state.isoCode !== 'TN' && "opacity-50 cursor-not-allowed bg-gray-50 text-gray-400"
                  )}
                  data-testid={`state-option-${state.isoCode}`}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === state.isoCode ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {state.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
