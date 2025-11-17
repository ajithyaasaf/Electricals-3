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
import { INDIAN_STATES } from "@shared/data/indian-states";

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

  const selectedState = useMemo(
    () => INDIAN_STATES.find((state) => state.code === value),
    [value]
  );

  const states = useMemo(() => INDIAN_STATES.map((state) => ({
    value: state.code,
    label: state.name,
    type: state.type,
  })), []);

  const groupedStates = useMemo(() => {
    const statesList = states.filter(s => s.type === 'state');
    const utList = states.filter(s => s.type === 'union_territory');
    return { statesList, utList };
  }, [states]);

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
            
            <CommandGroup heading="States">
              {groupedStates.statesList.map((state) => (
                <CommandItem
                  key={state.value}
                  value={state.label}
                  onSelect={() => {
                    onValueChange(state.value);
                    setOpen(false);
                  }}
                  data-testid={`state-option-${state.value}`}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === state.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {state.label}
                </CommandItem>
              ))}
            </CommandGroup>

            {groupedStates.utList.length > 0 && (
              <CommandGroup heading="Union Territories">
                {groupedStates.utList.map((state) => (
                  <CommandItem
                    key={state.value}
                    value={state.label}
                    onSelect={() => {
                      onValueChange(state.value);
                      setOpen(false);
                    }}
                    data-testid={`state-option-${state.value}`}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === state.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {state.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
