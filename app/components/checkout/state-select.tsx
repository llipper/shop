"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  BRAZILIAN_STATES,
  filterBrazilianStates,
  findBrazilianState,
} from "@/lib/brazilian-states";
import { cn } from "@/lib/utils";

type StateSelectProps = {
  value: string;
  onChange: (uf: string) => void;
  disabled?: boolean;
};

export function StateSelect({ value, onChange, disabled }: StateSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = findBrazilianState(value);
  const filteredStates = useMemo(() => filterBrazilianStates(query), [query]);

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-between rounded-lg px-3 font-normal",
            !selected && "text-muted-foreground",
          )}
        >
          {selected ? (
            <span className="truncate">
              <span className="font-medium">{selected.uf}</span>
              <span className="text-muted-foreground"> · {selected.name}</span>
            </span>
          ) : (
            "Selecione o estado"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="border-b border-border p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por UF ou estado..."
              className="h-9 pl-8"
            />
          </div>
        </div>

        <ul className="max-h-56 overflow-y-auto p-1">
          {filteredStates.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              Nenhum estado encontrado.
            </li>
          ) : (
            filteredStates.map((state) => {
              const isSelected = state.uf === value;

              return (
                <li key={state.uf}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(state.uf);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/70",
                    )}
                  >
                    <span>
                      <span className="font-medium">{state.uf}</span>
                      <span className="text-muted-foreground"> · {state.name}</span>
                    </span>
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isSelected ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}