import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { JournalEntryForm, JournalEntry } from "@/components/journal/JournalEntryForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Sparkles, BookText, Trash2 } from "lucide-react";
import { format, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { pageAnimation, cardAnimation, cardHover } from "@/lib/animations";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface JournalEntryWithId {
  id: string;
  date: string;
  title: string;
  description: string;
  key_events?: string;
}

// API functions
const fetchJournalEntries = async (): Promise<JournalEntryWithId[]> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

const addJournalEntry = async (entry: Omit<JournalEntryWithId, 'id' | 'created_at'>) => {
  const { data, error } = await supabase.from('journal_entries').insert([entry]).select();
  if (error) throw new Error(error.message);
  return data;
};

const deleteJournalEntry = async (id: string) => {
  const { error } = await supabase.from('journal_entries').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

const Journal = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [openAccordionItem, setOpenAccordionItem] = useState<string | undefined>();
  const location = useLocation();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery<JournalEntryWithId[]>({
    queryKey: ['journal_entries'],
    queryFn: fetchJournalEntries,
  });

  const addEntryMutation = useMutation({
    mutationFn: addJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal_entries'] });
      toast.success("Запись успешно добавлена в дневник!");
    },
    onError: (error: Error) => {
      toast.error("Не удалось добавить запись", { description: error.message });
    }
  });

  const deleteEntryMutation = useMutation({
    mutationFn: deleteJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal_entries'] });
      toast.success("Запись удалена.");
    },
    onError: (error: Error) => {
      toast.error("Не удалось удалить запись", { description: error.message });
    }
  });

  useEffect(() => {
    if (location.hash && entries.length > 0) {
      const entryId = location.hash.substring(1);
      if (entries.some(e => e.id === entryId)) {
        setOpenAccordionItem(entryId);
        setSelectedDate(undefined);
        setTimeout(() => {
          const element = document.getElementById(entryId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 300);
      }
    }
  }, [location.hash, entries]);

  const handleEntrySubmit = (data: JournalEntry) => {
    const newEntry = {
      title: data.title,
      date: format(data.date, 'yyyy-MM-dd'),
      description: data.description,
      key_events: data.keyEvents,
    };
    addEntryMutation.mutate(newEntry);
  };

  const handleDeleteEntry = (id: string) => {
    deleteEntryMutation.mutate(id);
  };

  const filteredEntries = (selectedDate
    ? entries.filter(entry => isSameDay(new Date(entry.date), selectedDate))
    : entries
  );

  return (
    <motion.div
      variants={pageAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold">Дневник жизни</h1>
        <p className="text-muted-foreground mt-2">
          Записывайте события, мысли и чувства, чтобы лучше понимать себя и свой жизненный путь.
        </p>
      </div>

      <motion.div variants={cardAnimation} whileHover={cardHover}>
        <JournalEntryForm onSubmit={handleEntrySubmit} />
      </motion.div>

      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
          <h2 className="text-2xl font-semibold">
            {selectedDate 
              ? `Записи за ${format(selectedDate, "d MMMM yyyy", { locale: ru })}`
              : "Все записи"}
          </h2>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP", { locale: ru }) : <span>Фильтр по дате</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  locale={ru}
                  captionLayout="dropdown-buttons"
                  fromYear={2020}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
            {selectedDate && (
              <Button variant="ghost" onClick={() => setSelectedDate(undefined)}>
                Сбросить
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : filteredEntries.length > 0 ? (
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-2"
            value={openAccordionItem}
            onValueChange={setOpenAccordionItem}
          >
            {filteredEntries.map((entry, index) => (
              <motion.div
                key={entry.id}
                id={entry.id}
                variants={cardAnimation}
                initial="initial"
                animate="animate"
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <AccordionItem value={entry.id} className="bg-card border rounded-md px-4">
                  <AccordionTrigger>
                    <div className="flex items-center justify-between w-full pr-4">
                      <span className="font-semibold text-lg text-left">{entry.title}</span>
                      <span className="text-sm text-muted-foreground flex items-center flex-shrink-0 ml-4">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(new Date(entry.date), "d MMMM yyyy", { locale: ru })}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-2">
                    <div>
                      <h4 className="font-semibold flex items-center text-base mb-1">
                        <BookText className="mr-2 h-5 w-5 text-primary" />
                        Описание дня
                      </h4>
                      <p className="text-muted-foreground pl-7">{entry.description}</p>
                    </div>
                    {entry.key_events && (
                      <div>
                        <h4 className="font-semibold flex items-center text-base mb-1">
                          <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
                          Ключевые события
                        </h4>
                        <div className="pl-7 flex flex-wrap gap-2 mt-2">
                          {entry.key_events.split(',').map((event, i) => (
                            <Badge key={i} variant="secondary">{event.trim()}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end pt-4 border-t mt-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить запись
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Это действие нельзя будет отменить. Запись будет удалена навсегда.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Отмена</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteEntry(entry.id)}>
                              Да, удалить
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        ) : (
          <div className="text-center text-muted-foreground py-16 border rounded-md bg-card">
            <p>Записи не найдены.</p>
            {selectedDate && <p className="mt-1">Попробуйте выбрать другую дату.</p>}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Journal;