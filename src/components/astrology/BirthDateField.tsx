"use client";

import { useState, useEffect } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { format, parse } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BirthData } from "./BirthDataForm";

interface BirthDateFieldProps {
  field: ControllerRenderProps<BirthData, "date">;
}

export function BirthDateField({ field }: BirthDateFieldProps) {
  const [inputValue, setInputValue] = useState<string>(
    field.value ? format(field.value, "dd.MM.yyyy") : ""
  );

  useEffect(() => {
    if (field.value) {
      const formattedDate = format(field.value, "dd.MM.yyyy");
      if (formattedDate !== inputValue) {
        setInputValue(formattedDate);
      }
    } else if (inputValue !== "") {
      setInputValue("");
    }
  }, [field.value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.length >= 10) {
      try {
        const parsedDate = parse(value, "dd.MM.yyyy", new Date());
        if (
          !isNaN(parsedDate.getTime()) &&
          parsedDate <= new Date() &&
          parsedDate.getFullYear() >= 1920
        ) {
          field.onChange(parsedDate);
        }
      } catch (error) {
        // Ignore parsing errors while typing
      }
    }
  };

  return (
    <FormItem className="flex flex-col">
      <FormLabel>Дата рождения</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ДД.ММ.ГГГГ"
                value={inputValue}
                onChange={handleInputChange}
                className="pl-9"
              />
            </div>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={(date) => {
              if (date) {
                field.onChange(date);
              }
            }}
            disabled={(date) => date > new Date()}
            initialFocus
            locale={ru}
            captionLayout="dropdown-buttons"
            fromYear={1920}
            toYear={new Date().getFullYear()}
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  );
}