"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Clock, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { cities } from "@/data/cities";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BirthDateField } from "./BirthDateField";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Имя должно содержать хотя бы 2 символа.",
  }),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Пожалуйста, выберите ваш пол.",
  }),
  date: z.date({
    required_error: "Пожалуйста, выберите дату рождения.",
  }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: "Введите корректное время в формате ЧЧ:ММ.",
  }),
  city: z.string().min(1, {
    message: "Пожалуйста, выберите город.",
  }),
});

export type BirthData = z.infer<typeof formSchema>;

interface BirthDataFormProps {
  onSubmit: (data: BirthData) => void;
  isCalculating?: boolean;
}

const cityOptions = cities.map(city => ({
  value: city.name,
  label: `${city.name}, ${city.country}`
}));

export function BirthDataForm({ onSubmit, isCalculating }: BirthDataFormProps) {
  const form = useForm<BirthData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      time: "12:00",
      city: "Москва",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Данные для расчета</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Имя</FormLabel>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input placeholder="Введите ваше имя" {...field} className="pl-9" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Пол</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex items-center space-x-4 pt-2"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="male" />
                          </FormControl>
                          <FormLabel className="font-normal">Мужской</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="female" />
                          </FormControl>
                          <FormLabel className="font-normal">Женский</FormLabel>
                        </FormItem>
                         <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="other" />
                          </FormControl>
                          <FormLabel className="font-normal">Другой</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => <BirthDateField field={field} />}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Время рождения</FormLabel>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="time" {...field} className="pl-9" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Место рождения</FormLabel>
                    <Combobox
                      options={cityOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Выберите город..."
                      emptyMessage="Город не найден."
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isCalculating}>
              {isCalculating ? "Расчет..." : "Рассчитать карту"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}