"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, PenSquare, Mic, StopCircle, Loader2, Moon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateMoonPhase, MoonData, getMoonData } from "@/lib/moonCalculations";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Заголовок должен содержать хотя бы 3 символа.",
  }),
  date: z.date({
    required_error: "Пожалуйста, выберите дату сна.",
  }),
  emotional_intensity: z.number().min(1).max(5).default(3),
  dream: z.string().min(10, {
    message: "Описание сна должно содержать хотя бы 10 символов.",
  }),
  dayContext: z.string().optional(),
});

export type DreamJournalEntry = z.infer<typeof formSchema>;

interface DreamJournalFormProps {
  onSubmit: (data: DreamJournalEntry) => void;
}

export function DreamJournalForm({ onSubmit }: DreamJournalFormProps) {
  const form = useForm<DreamJournalEntry>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: new Date(),
      emotional_intensity: 3,
      dream: "",
      dayContext: "",
    },
  });

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [moonData, setMoonData] = useState<MoonData | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Получаем данные о луне при изменении даты
  useEffect(() => {
    const fetchMoonData = async () => {
      const date = form.watch("date");
      if (date) {
        const dateString = format(date, "yyyy-MM-dd");
        try {
          // Используем новую функцию с RapidAPI
          const moonInfo = await getMoonData(dateString);
          setMoonData(moonInfo);
        } catch (error) {
          console.error('Ошибка получения данных о луне:', error);
          // Fallback на локальный расчет
          const fallbackInfo = calculateMoonPhase(dateString);
          setMoonData(fallbackInfo);
        }
      }
    };

    fetchMoonData();
  }, [form.watch("date")]);

  const handleFormSubmit = (data: DreamJournalEntry) => {
    onSubmit(data);
    form.reset({
      title: "",
      date: new Date(),
      emotional_intensity: 3,
      dream: "",
      dayContext: "",
    });
  };

  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    const transcriptionToast = toast.loading("Протей расшифровывает вашу речь...");

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'dream.webm');

      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      const currentDreamValue = form.getValues("dream");
      const newText = currentDreamValue ? `${currentDreamValue}\n${data.transcription}` : data.transcription;
      form.setValue("dream", newText, { shouldValidate: true });
      toast.success("Ваша речь успешно расшифрована!", { id: transcriptionToast });

    } catch (error: any) {
      console.error("Ошибка транскрибации:", error);
      toast.error("Не удалось расшифровать аудио", {
        description: error.message,
        id: transcriptionToast,
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        handleTranscription(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Ошибка доступа к микрофону:", error);
      toast.error("Не удалось получить доступ к микрофону.", {
        description: "Пожалуйста, проверьте разрешения в настройках вашего браузера.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PenSquare className="mr-2 h-5 w-5" />
          Записать новый сон
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Заголовок сна</FormLabel>
                  <FormControl>
                    <Input placeholder="Например: Полет над городом" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Дата сна</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ru })
                            ) : (
                              <span>Выберите дату</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                          locale={ru}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emotional_intensity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Эмоциональная окраска сна</FormLabel>
                    <FormControl>
                      <Slider
                        defaultValue={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        max={5}
                        min={1}
                        step={1}
                        className="pt-4"
                      />
                    </FormControl>
                    <div className="flex justify-between text-sm text-muted-foreground pt-2">
                      <span>🟦 спокойный</span>
                      <span>🔥 интенсивный</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Информация о луне */}
            {moonData && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Moon className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">Луна в ночь сна</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="text-sm">
                          <span className="mr-1">{moonData.phaseEmoji}</span>
                          {moonData.phase}
                        </Badge>
                        <Badge variant="outline" className="text-sm">
                          <span className="mr-1">{moonData.signEmoji}</span>
                          {moonData.sign}
                        </Badge>
                        <Badge variant="outline" className="text-sm">
                          {moonData.illumination}% освещенность
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="dream"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Опишите ваш сон</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        placeholder="Мне снилось, что я... или нажмите на микрофон, чтобы надиктовать."
                        className="min-h-[100px] pr-12"
                        {...field}
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={handleMicClick}
                        disabled={isTranscribing}
                      >
                        {isTranscribing ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : isRecording ? (
                          <StopCircle className="h-5 w-5 text-red-500" />
                        ) : (
                          <Mic className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dayContext"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Контекст дня (необязательно)</FormLabel>
                  <FormControl>
                    <Input placeholder="Например: сильная усталость, стресс на работе, прием лекарств" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Сохранить сон</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}