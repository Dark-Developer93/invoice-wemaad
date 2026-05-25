"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormControl } from "@/components/ui/form";
import { CURRENCY_OPTIONS } from "@/lib/constants/currency";

interface CurrencySelectProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function CurrencySelect({ value, onValueChange }: CurrencySelectProps) {
  return (
    <Select onValueChange={onValueChange} defaultValue={value}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Select Currency" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {CURRENCY_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
