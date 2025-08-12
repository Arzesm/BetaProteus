"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, BookPlus, Mic, StopCircle, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const formSchema = z.object({
  date: z.date({
    required_error: "Пожалуйста, выберите дату.",
  }),
  title: z.string().min(3, {
    message: "Заголовок должен содержать хотя бы 3 символа.",
  }),
  description: z.string().min(10, {
    message: "Описание дня должно содержать хотя бы 10 символов.",
  }),
  keyEvents: z.string().optional(),
});

export type JournalEntry = z.infer<typeof formSchema>;

interface JournalEntryFormProps {
  onSubmit: (data: JournalEntry) => void;
}

export function JournalEntryForm({ onSubmit }: JournalEntryFormProps) {
  const form = useForm<JournalEntry>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      title: "",
      description: "",
      keyEvents: "",
    },
  });

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleFormSubmit = (data: JournalEntry) => {
    onSubmit(data);
    form.reset({
      date: new Date(),
      title: "",
      description: "",
      keyEvents: "",
    });
  };

  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    const transcriptionToast = toast.loading("Протей расшифровывает вашу речь...");

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'journal.webm');

      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: formData,
      });

      if (error) {
        throw error;
      }

      const currentDescriptionValue = form.getValues("description");
      const newText = currentDescriptionValue ? `${currentDescriptionValue}\n${data.transcription}` : data.transcription;
      form.setValue("description", newText, { shouldValidate: true });
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
          <BookPlus className="mr-2 h-5 w-5" />
          Добавить запись о дне
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Заголовок дня</FormLabel>
                    <FormControl>
                      <Input placeholder="Например: Продуктивный день" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Дата</FormLabel>
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
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Как прошел ваш день?</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        placeholder="Опишите свои мысли, чувства и события... или нажмите на микрофон, чтобы надиктовать."
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
              name="keyEvents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ключевые события (необязательно)</FormLabel>
                  <FormControl>
                    <Input placeholder="Например: Встреча с другом, завершение проекта" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Сохранить запись</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}