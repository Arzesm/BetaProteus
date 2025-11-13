import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Moon, Sparkles, BookOpen, BookText, Star, ImageIcon, Calendar as CalendarIcon, Trash2, Search, Smile } from "lucide-react";
import { DreamJournalForm, DreamJournalEntry } from "@/components/dreams/DreamJournalForm";

import { RetrospectiveWidget } from "@/components/dashboard/RetrospectiveWidget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { pageAnimation, cardAnimation, cardHover } from "@/lib/animations";
import { supabase } from "@/integrations/supabase/client";
import { getMoonData } from "@/lib/moonCalculations";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";


export interface Note {
  id: string;
  text: string;
  date: string;
}

export interface Dream {
  id: string;
  title: string;
  date: string;
  plot: string;
  interpretation: string;
  astrological_indicators: string[];
  generated_image?: string;
  notes?: Note[];
  emotional_intensity?: number;
  moon_data?: {
    sign: string;
    signEmoji: string;
    phase: string;
    phaseEmoji: string;
    illumination: number;
  };
}



// API functions for dreams
const fetchDreams = async (): Promise<Dream[]> => {
  const { data, error } = await supabase
    .from('dreams')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return data.map(d => ({...d, date: d.date ? new Date(d.date).toISOString() : new Date().toISOString()}));
};

const addDream = async (dream: Omit<Dream, 'id'>) => {
  const { data, error } = await supabase.from('dreams').insert([dream]).select();
  if (error) throw new Error(error.message);
  return data;
};

const updateDream = async (dream: Partial<Dream> & { id: string }) => {
  const { id, ...updateData } = dream;
  const { data, error } = await supabase.from('dreams').update(updateData).eq('id', id).select();
  if (error) throw new Error(error.message);
  return data;
};

const deleteDream = async (id: string) => {
  const { error } = await supabase.from('dreams').delete().eq('id', id);
  if (error) throw new Error(error.message);
};



const Dreams = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dreamToDelete, setDreamToDelete] = useState<string | null>(null);
  const [openDreamId, setOpenDreamId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'write' | 'journal'>('write');
  const queryClient = useQueryClient();

  // Обработчик событий для открытия диалога удаления
  useEffect(() => {
    const handleOpenDeleteDialog = (event: CustomEvent) => {
      setDreamToDelete(event.detail);
      setDeleteDialogOpen(true);
    };

    window.addEventListener('openDeleteDialog', handleOpenDeleteDialog as EventListener);
    
    return () => {
      window.removeEventListener('openDeleteDialog', handleOpenDeleteDialog as EventListener);
    };
  }, []);

  // Функции для описания лунных данных
  const getMoonPhaseDescription = (phase: string) => {
    const descriptions: { [key: string]: string } = {
      'Новолуние': 'Время новых начинаний',
      'Растущий серп': 'Период роста и развития',
      'Первая четверть': 'Время принятия решений',
      'Растущая луна': 'Энергия накопления',
      'Полнолуние': 'Пик эмоциональной активности',
      'Убывающая луна': 'Время осмысления',
      'Последняя четверть': 'Период завершения',
      'Убывающий серп': 'Время отпускания'
    };
    return descriptions[phase] || 'Лунное влияние';
  };

  const getMoonSignDescription = (sign: string) => {
    const descriptions: { [key: string]: string } = {
      'Овен': 'Энергия и импульсивность',
      'Телец': 'Стабильность и чувственность',
      'Близнецы': 'Любознательность и общение',
      'Рак': 'Эмоциональность и интуиция',
      'Лев': 'Творчество и самовыражение',
      'Дева': 'Анализ и совершенство',
      'Весы': 'Гармония и баланс',
      'Скорпион': 'Глубина и трансформация',
      'Стрелец': 'Приключения и философия',
      'Козерог': 'Ответственность и структура',
      'Водолей': 'Инновации и независимость',
      'Рыбы': 'Мечтательность и сострадание'
    };
    return descriptions[sign] || 'Лунное влияние';
  };

  const { data: dreams = [], isLoading } = useQuery<Dream[]>({
    queryKey: ['dreams'],
    queryFn: fetchDreams,
  });

  const addDreamMutation = useMutation({
    mutationFn: addDream,
    onSuccess: (data) => {
      const createdId = Array.isArray(data) && data[0]?.id ? String(data[0].id) : undefined;
      if (createdId) {
        setOpenDreamId(createdId);
        setActiveTab('journal');
      }
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
    },
    onError: (error: Error) => {
      toast.error("Не удалось сохранить сон", { description: error.message });
    }
  });

  const updateDreamMutation = useMutation({
    mutationFn: updateDream,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
    },
    onError: (error: Error) => {
      toast.error("Не удалось обновить сон", { description: error.message });
    }
  });

  const deleteDreamMutation = useMutation({
    mutationFn: deleteDream,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
      toast.success("Сон успешно удален.");
    },
    onError: (error: Error) => {
      toast.error("Не удалось удалить сон", { description: error.message });
    }
  });

  const getDreamInterpretation = async (dreamText: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-interpretation', {
        body: { dreamText },
      });
      if (error) throw error;
      return data.interpretation;
    } catch (error: any) {
      let errorDescription = "Не удалось получить интерпретацию.";
      if (error instanceof FunctionsHttpError) {
        try {
          const errorJson = await error.context.json();
          if (errorJson.error) errorDescription = errorJson.error;
        } catch {}
      }
      toast.error("Ошибка интерпретации", { description: errorDescription });
      return `К сожалению, не удалось получить толкование: ${errorDescription}`;
    }
  };

  const getDreamMoonData = async (date: string) => {
    // Используем новую систему с SwissEph
    console.log('Получаем данные о луне с помощью SwissEph для даты:', date);
    try {
      const moonData = await getMoonData(date);
      console.log('Получили данные о луне:', moonData);
      return moonData;
    } catch (error) {
      console.error('Ошибка получения данных о луне:', error);
      // Возвращаем базовые данные в случае ошибки
      return {
        phase: 'Неизвестная фаза',
        phaseEmoji: '🌙',
        sign: 'Неизвестный знак',
        signEmoji: '⭐',
        illumination: 50
      };
    }
  };



  const handleDreamSubmit = async (data: DreamJournalEntry) => {
    const loadingToast = toast.loading("Анализируем ваш сон и рассчитываем положение Луны...");

    // Get interpretation from AI
    const interpretation = await getDreamInterpretation(data.dream);
    
    // Get moon data
    const moonData = await getDreamMoonData(format(data.date, 'yyyy-MM-dd'));
    
    const newDream = {
      title: data.title,
      date: format(data.date, 'yyyy-MM-dd'),
      plot: data.dream,
      interpretation: interpretation,
      astrological_indicators: [],
      notes: [],
      emotional_intensity: data.emotional_intensity,
      moon_data: {
        sign: moonData.sign,
        signEmoji: moonData.signEmoji,
        phase: moonData.phase,
        phaseEmoji: moonData.phaseEmoji,
        illumination: moonData.illumination
      },
    };
    
    addDreamMutation.mutate(newDream, {
      onSuccess: () => {
        if (!interpretation.startsWith("К сожалению")) {
          toast.success("Ваш сон и его толкование сохранены!");
        }
        toast.dismiss(loadingToast);
      },
      onError: () => {
        toast.dismiss(loadingToast);
      }
    });
  };

  // Scroll to the newly created/opened dream when it appears in the list
  useEffect(() => {
    if (!openDreamId || activeTab !== 'journal') return;
    const el = document.getElementById(`dream-${openDreamId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [dreams, openDreamId, activeTab]);

  const handleGenerateImage = async (dreamId: string) => {
    const dream = dreams.find(d => d.id === dreamId);
    if (!dream) return;

    const loadingToast = toast.loading("Протей рисует ваш сон...");
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt: dream.plot },
      });
      if (error) throw error;
      updateDreamMutation.mutate({ id: dreamId, generated_image: data.image }, {
        onSuccess: () => {
          toast.success("Образ вашего сна готов!");
          queryClient.invalidateQueries({ queryKey: ['dreams'] });
        },
      });
    } catch (error: any) {
      let errorDescription = "Не удалось сгенерировать изображение.";
      if (error instanceof FunctionsHttpError) {
        try {
          const errorJson = await error.context.json();
          if (errorJson.error) errorDescription = errorJson.error;
        } catch {}
      }
      toast.error("Ошибка генерации изображения", { description: errorDescription });
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleDeleteDream = (dreamId: string) => {
    deleteDreamMutation.mutate(dreamId);
  };



  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  const filteredDreams = dreams
    .filter(dream => {
      if (!selectedDate) return true;
      return isSameDay(new Date(dream.date), selectedDate);
    })
    .filter(dream => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return dream.title.toLowerCase().includes(query) ||
             dream.plot.toLowerCase().includes(query) ||
             dream.interpretation.toLowerCase().includes(query);
    });

  const intensityMap: { [key: number]: string } = {
    1: '🟦 Спокойный',
    2: '🙂 Слегка эмоциональный',
    3: '😐 Умеренный',
    4: '😟 Эмоциональный',
    5: '🔥 Интенсивный'
  };

  return (
    <motion.div
      variants={pageAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      <div>
        <h1 className="text-3xl font-bold">Толкование снов</h1>
        <p className="text-muted-foreground mt-2">
          Анализируйте свои сны и получайте подсказки от подсознания.
        </p>
      </div>

      <Tabs defaultValue="write" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="write" className="flex items-center gap-2" onClick={() => setActiveTab('write')}>
            <BookText className="h-4 w-4" />
            Записать сон
          </TabsTrigger>
          <TabsTrigger value="journal" className="flex items-center gap-2" onClick={() => setActiveTab('journal')}>
            <BookOpen className="h-4 w-4" />
            Ваш дневник снов
          </TabsTrigger>
        </TabsList>

        <TabsContent value="write" className="space-y-6">
          <motion.div variants={cardAnimation} whileHover={cardHover}>
            <DreamJournalForm onSubmit={handleDreamSubmit} />
          </motion.div>



          <motion.div variants={cardAnimation} whileHover={cardHover}>
            <RetrospectiveWidget />
          </motion.div>
        </TabsContent>

        <TabsContent value="journal" className="space-y-6">
          <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className="text-2xl font-semibold flex items-center">
                <BookOpen className="mr-2 h-6 w-6" />
                {selectedDate 
                  ? `Сны за ${format(selectedDate, "d MMMM yyyy", { locale: ru })}`
                  : "Ваш дневник снов"}
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Поиск по снам..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-full sm:w-[280px]"
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full sm:w-[280px] justify-start text-left font-normal",
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
            ) : filteredDreams.length > 0 ? (
              <Accordion type="single" collapsible className="w-full" value={openDreamId} onValueChange={setOpenDreamId}>
                {filteredDreams.map((dream, index) => (
                    <motion.div
                      key={dream.id}
                      variants={cardAnimation}
                      initial="initial"
                      animate="animate"
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                                          <AccordionItem value={dream.id} className="border border-border/50 rounded-lg mb-4 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300" id={`dream-${dream.id}`}>
                                            <AccordionTrigger className="px-6 py-4 hover:bg-gradient-to-r hover:from-slate-50 hover:to-gray-50 dark:hover:from-slate-950/20 dark:hover:to-gray-950/20 transition-all duration-300">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                            <span className="font-semibold">{dream.title}</span>
                            <span className="text-sm text-muted-foreground">({format(new Date(dream.date), "d MMMM yyyy", { locale: ru })})</span>
                            {dream.moon_data && (
                              <div className="flex items-center space-x-2 ml-2">
                                <Moon className="h-4 w-4 text-blue-400" />
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                    {dream.moon_data.phase}
                                  </span>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                    {dream.moon_data.sign}
                                  </span>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-blue-500 dark:text-blue-300">
                                    {dream.moon_data.illumination}%
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                            <div 
                              className="relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium text-xs px-3 py-1 rounded-md cursor-pointer flex items-center"
                              onClick={() => {
                                // Открываем диалог программно
                                const event = new CustomEvent('openDeleteDialog', { detail: dream.id });
                                window.dispatchEvent(event);
                              }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                              <Trash2 className="mr-1 h-3 w-3 relative z-10" />
                              <span className="relative z-10">Удалить</span>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-6 pt-4 px-6 pb-6 bg-gradient-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-950/10 dark:to-gray-950/10">
                            {dream.emotional_intensity && (
                              <div>
                                <h4 className="font-semibold flex items-center text-base mb-3">
                                  <Smile className="mr-2 h-5 w-5 text-green-500" />
                                  Эмоциональная окраска
                                </h4>
                                <div className="relative bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 rounded-xl p-4 shadow-sm">
                                  <div className="absolute top-2 right-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                                      <Smile className="w-4 h-4 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-foreground font-medium">{intensityMap[dream.emotional_intensity]}</p>
                                </div>
                              </div>
                            )}
                                                    <div>
                          <h4 className="font-semibold flex items-center text-base mb-3">
                            <BookText className="mr-2 h-5 w-5 text-primary" />
                            Сюжет сна
                          </h4>
                          <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 shadow-sm">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 rounded-t-xl"></div>
                            <p className="text-foreground leading-relaxed">{dream.plot}</p>
                          </div>
                        </div>
                                                    <div>
                          <h4 className="font-semibold flex items-center text-base mb-3">
                            <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
                            Интерпретация от Протея
                          </h4>
                          <div className="relative bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 shadow-sm">
                            <div className="absolute -top-2 -left-2 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg"></div>
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-br from-orange-400 to-red-500 rounded-full shadow-lg"></div>
                            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-md"></div>
                            <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-gradient-to-br from-orange-300 to-red-400 rounded-full shadow-md"></div>
                            <div 
                              className="text-foreground leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                              dangerouslySetInnerHTML={{ 
                                __html: dream.interpretation
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/\n/g, '<br>')
                              }}
                            />
                          </div>
                        </div>

                        {dream.moon_data && (
                          <div>
                            <h4 className="font-semibold flex items-center text-base mb-3">
                              <Moon className="mr-2 h-5 w-5 text-blue-400" />
                              Луна в день сна
                            </h4>
                            <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 shadow-sm">
                              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 rounded-t-xl"></div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Фаза луны:</span>
                                    <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700">
                                      {dream.moon_data.phase}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Знак зодиака:</span>
                                    <Badge className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700">
                                      {dream.moon_data.sign}
                                    </Badge>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Освещенность:</span>
                                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                        {dream.moon_data.illumination}%
                                      </span>
                                    </div>
                                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                                      <div 
                                        className="bg-gradient-to-r from-blue-400 to-indigo-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${dream.moon_data.illumination}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-center justify-center space-y-3">
                                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                                    <Moon className="w-8 h-8 text-white" />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                      {getMoonPhaseDescription(dream.moon_data.phase)}
                                    </p>
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                                      {getMoonSignDescription(dream.moon_data.sign)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="pt-2 space-y-4">
                              <Button 
                                variant="outline" 
                                onClick={() => handleGenerateImage(dream.id)}
                                className="relative overflow-hidden bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20 border-pink-200 dark:border-pink-800 hover:from-pink-100 hover:to-purple-100 dark:hover:from-pink-900 dark:hover:to-purple-900 transition-all duration-300 shadow-md hover:shadow-lg"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 to-purple-400/10 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                <ImageIcon className="mr-2 h-4 w-4 relative z-10" />
                                <span className="relative z-10">Сгенерировать картинку сна</span>
                              </Button>
                              {dream.generated_image && (
                                <div className="mt-4">
                                  <h4 className="font-semibold flex items-center text-base mb-3">
                                    <ImageIcon className="mr-2 h-5 w-5 text-purple-500" />
                                    Образ вашего сна
                                  </h4>
                                  <div className="relative group bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 shadow-sm">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 via-pink-500 to-rose-600 rounded-t-xl"></div>
                                    <div className="relative">
                                      <img 
                                        src={dream.generated_image} 
                                        alt={`Визуализация сна: ${dream.title}`} 
                                        className="relative rounded-lg border border-white dark:border-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group-hover:border-pink-400 dark:group-hover:border-purple-400 max-w-full max-h-96 object-contain w-full cursor-pointer" 
                                        onClick={() => handleImageClick(dream.generated_image!)}
                                      />
                                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        Кликните для увеличения
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>





                                                    <div className="flex justify-end pt-4 border-t border-border/50 mt-4">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="destructive" 
                                size="default"
                                className="relative overflow-hidden bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                                <Trash2 className="mr-2 h-5 w-5 relative z-10" />
                                <span className="relative z-10">Удалить сон</span>
                              </Button>
                            </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Это действие нельзя будет отменить. Запись о сне будет удалена навсегда.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteDream(dream.id)}>
                                      Да, удалить
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                ))}
              </Accordion>
            ) : (
                        <div className="text-center py-16">
            <div className="relative bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 border border-slate-200 dark:border-slate-800 rounded-xl p-8 shadow-sm">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-400 via-gray-500 to-zinc-600 rounded-t-xl"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Search className="w-8 h-8 text-white" />
              </div>
              <p className="text-foreground font-medium mb-2">Сны, соответствующие вашему запросу, не найдены.</p>
              {(selectedDate || searchQuery) && (
                <p className="text-muted-foreground">Попробуйте изменить фильтры или поисковый запрос.</p>
              )}
            </div>
          </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Модальное окно для просмотра изображения */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Просмотр изображения сна</DialogTitle>
            <DialogDescription>Полноразмерное изображение сгенерированного сна</DialogDescription>
          </DialogHeader>
          <div className="relative w-full h-full">
            {selectedImage && (
              <img 
                src={selectedImage} 
                alt="Полноразмерное изображение сна" 
                className="w-full h-full object-contain rounded-lg"
              />
            )}
            <Button
              variant="outline"
              size="sm"
              className="absolute top-4 right-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900"
              onClick={() => setIsImageModalOpen(false)}
            >
              ✕
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Глобальный диалог для удаления снов */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя будет отменить. Запись о сне будет удалена навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (dreamToDelete) {
                  handleDeleteDream(dreamToDelete);
                  setDeleteDialogOpen(false);
                  setDreamToDelete(null);
                }
              }}
            >
              Да, удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default Dreams;