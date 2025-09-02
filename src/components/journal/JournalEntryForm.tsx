"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, BookPlus, Mic, StopCircle, Loader2, Bold, Italic, Heading2, Quote, List, ListOrdered, Code, Strikethrough } from "lucide-react";
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
  const [visualMode, setVisualMode] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const visualRef = useRef<HTMLDivElement | null>(null);

  const handleFormSubmit = (data: JournalEntry) => {
    onSubmit(data);
    form.reset({
      date: new Date(),
      title: "",
      description: "",
      keyEvents: "",
    });
  };

  // Markdown formatting helpers (текстовый режим)
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  const updateSelection = (updater: (text: string, start: number, end: number) => { value: string; newStart: number; newEnd: number }) => {
    const textarea = descriptionRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const current = form.getValues("description") || "";
    const { value, newStart, newEnd } = updater(current, start, end);
    form.setValue("description", value, { shouldValidate: true });
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newStart, newEnd);
    });
  };

  const wrapSelection = (prefix: string, suffix: string = prefix) => {
    updateSelection((text, start, end) => {
      const before = text.slice(0, start);
      const selectedRaw = text.slice(start, end);
      const after = text.slice(end);

      // Если нет выделения — вставляем маркеры и ставим курсор между ними
      if (!selectedRaw) {
        const insertion = `${prefix}${suffix}`;
        const value = `${before}${insertion}${after}`;
        const caret = (before.length + prefix.length) as number;
        return { value, newStart: caret, newEnd: caret };
      }

      // Сохраняем ведущие/замыкающие пробелы снаружи маркеров
      const leadingSpacesMatch = selectedRaw.match(/^\s+/);
      const trailingSpacesMatch = selectedRaw.match(/\s+$/);
      const leading = leadingSpacesMatch ? leadingSpacesMatch[0] : "";
      const trailing = trailingSpacesMatch ? trailingSpacesMatch[0] : "";
      const selected = selectedRaw.trim();

      const wrapped = `${leading}${prefix}${selected}${suffix}${trailing}`;
      const value = `${before}${wrapped}${after}`;
      const newStart = before.length + leading.length + prefix.length;
      const newEnd = newStart + selected.length;
      return { value, newStart, newEnd };
    });
  };

  const toggleLinePrefix = (marker: string) => {
    updateSelection((text, start, end) => {
      const lines = text.split("\n");
      let charCount = 0;
      const newLines = lines.map((line) => {
        const lineStart = charCount;
        const lineEnd = charCount + line.length;
        const inSelection = lineEnd >= start && lineStart <= end;
        charCount += line.length + 1; // +1 for \n
        if (!inSelection) return line;
        const trimmed = line.trimStart();
        const leadingSpaces = line.slice(0, line.length - trimmed.length);
        if (trimmed.startsWith(marker)) {
          return leadingSpaces + trimmed.slice(marker.length).trimStart();
        }
        return leadingSpaces + `${marker} ` + trimmed;
      });
      const value = newLines.join("\n");
      return { value, newStart: start, newEnd: start + (value.length - text.length) + (end - start) };
    });
  };

  const insertHeading = (level: number) => {
    const hashes = "#".repeat(Math.min(Math.max(level, 1), 6));
    updateSelection((text, start, end) => {
      // Place heading at start of current line
      const before = text.slice(0, start);
      const lineStart = before.lastIndexOf("\n") + 1;
      const after = text.slice(end);
      const selected = text.slice(start, end) || "Заголовок";
      const currentLine = text.slice(lineStart, end);
      const prefix = `${hashes} `;
      let newLine = selected;
      // Replace any existing leading hashes in the current selection line
      newLine = newLine.replace(/^\s*#{1,6}\s*/g, "");
      const value = text.slice(0, lineStart) + prefix + newLine + after;
      const newStart = lineStart + prefix.length;
      const newEnd = newStart + newLine.length;
      return { value, newStart, newEnd };
    });
  };

  // Визуальный режим: execCommand-обёртки
  const focusVisual = () => {
    if (visualRef.current) {
      visualRef.current.focus();
    }
  };

  const exec = (command: string, value?: string) => {
    focusVisual();
    try {
      document.execCommand(command, false, value);
      // синхронизируем HTML в форму
      const html = visualRef.current?.innerHTML || "";
      form.setValue("description", html, { shouldValidate: true });
    } catch {}
  };

  const toggleBlock = (block: 'h2' | 'blockquote' | 'pre') => {
    focusVisual();
    if (!visualRef.current) return;
    // Попробуем использовать форматирование блока
    if (block === 'h2') exec('formatBlock', '<h2>');
    else if (block === 'blockquote') exec('formatBlock', '<blockquote>');
    else if (block === 'pre') exec('formatBlock', '<pre>');
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
                      <div className="flex flex-wrap gap-1 mb-2">
                        {visualMode ? (
                          <>
                            <Button type="button" size="icon" variant="ghost" title="Жирный" onClick={() => exec('bold')}><Bold className="h-4 w-4" /></Button>
                            <Button type="button" size="icon" variant="ghost" title="Курсив" onClick={() => exec('italic')}><Italic className="h-4 w-4" /></Button>
                            <Button type="button" size="icon" variant="ghost" title="Зачеркнутый" onClick={() => exec('strikeThrough')}><Strikethrough className="h-4 w-4" /></Button>
                            <Button type="button" size="icon" variant="ghost" title="Заголовок" onClick={() => toggleBlock('h2')}><Heading2 className="h-4 w-4" /></Button>
                            <Button type="button" size="icon" variant="ghost" title="Цитата" onClick={() => toggleBlock('blockquote')}><Quote className="h-4 w-4" /></Button>
                            <Button type="button" size="icon" variant="ghost" title="Маркированный список" onClick={() => exec('insertUnorderedList')}><List className="h-4 w-4" /></Button>
                            <Button type="button" size="icon" variant="ghost" title="Нумерованный список" onClick={() => exec('insertOrderedList')}><ListOrdered className="h-4 w-4" /></Button>
                            <Button type="button" size="icon" variant="ghost" title="Код" onClick={() => toggleBlock('pre')}><Code className="h-4 w-4" /></Button>
                          </>
                        ) : (
                          <>
                            <Button type="button" size="icon" variant="ghost" title="Жирный (Ctrl+B)" onClick={() => wrapSelection("**")}><Bold className="h-4 w-4" /></Button>
                            <Button type="button" size="icon" variant="ghost" title="Курсив (Ctrl+I)" onClick={() => wrapSelection("*")}><Italic className="h-4 w-4" /></Button>
                            <Button type="button" size="icon" variant="ghost" title="Зачеркнутый" onClick={() => wrapSelection("~~")}><Strikethrough className="h-4 w-4" /></Button>
                            <Button type="button" size="icon" variant="ghost" title="Заголовок" onClick={() => insertHeading(2)}><Heading2 className="h-4 w-4" /></Button>
                            <Button type="button" size="icon" variant="ghost" title="Цитата" onClick={() => toggleLinePrefix(">")}><Quote className="h-4 w-4" /></Button>
                            <Button type="button" size="icon" variant="ghost" title="Маркированный список" onClick={() => toggleLinePrefix("-")}><List className="h-4 w-4" /></Button>
                            <Button type="button" size="icon" variant="ghost" title="Нумерованный список" onClick={() => toggleLinePrefix("1.")}><ListOrdered className="h-4 w-4" /></Button>
                            <Button type="button" size="icon" variant="ghost" title="Код" onClick={() => wrapSelection("`")}><Code className="h-4 w-4" /></Button>
                          </>
                        )}
                      </div>
                      {visualMode ? (
                        <div
                          ref={visualRef}
                          contentEditable
                          className="min-h-[120px] pr-12 rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring prose prose-sm max-w-none dark:prose-invert"
                          onInput={(e) => {
                            const html = (e.target as HTMLDivElement).innerHTML;
                            form.setValue('description', html, { shouldValidate: true });
                          }}
                          onBlur={(e) => {
                            const html = (e.target as HTMLDivElement).innerHTML;
                            form.setValue('description', html, { shouldValidate: true });
                          }}
                          dangerouslySetInnerHTML={{ __html: field.value || '' }}
                        />
                      ) : (
                        <Textarea
                          placeholder="Опишите свои мысли, чувства и события... или нажмите на микрофон, чтобы надиктовать."
                          className="min-h-[100px] pr-12"
                          {...field}
                          ref={(el) => {
                            descriptionRef.current = el;
                            // forward ref to RHF
                            if (typeof field.ref === 'function') field.ref(el);
                            else (field as any).ref = el;
                          }}
                        />
                      )}
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