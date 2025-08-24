import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ru } from "date-fns/locale";
import { format } from "date-fns";
import { Moon } from "lucide-react";
import { getMoonData, clearCriticalDatesCache } from "@/lib/moonCalculations";

interface MoonData {
  phase: string;
  phaseEmoji: string;
  sign: string;
  signEmoji: string;
  illumination: number;
}

export function AstroCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [moonData, setMoonData] = useState<MoonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [month, setMonth] = useState<Date>(new Date());
  const [fullMoons, setFullMoons] = useState<Set<string>>(new Set());
  const [newMoons, setNewMoons] = useState<Set<string>>(new Set());

  // При инициализации компонента очищаем кэш для критических дат
  useEffect(() => {
    const clearCriticalDatesCache = async () => {
      try {
        // Очищаем кэш критических дат при загрузке страницы
        console.log('🗑️ Очищаем кэш критических дат при инициализации...');
        clearCriticalDatesCache();
        console.log('✅ Кэш критических дат очищен при инициализации');
      } catch (error) {
        console.warn('⚠️ Не удалось очистить кэш при инициализации:', error);
      }
    };
    
    clearCriticalDatesCache();
  }, []);

  const getMoonPhaseDescription = (phase: string) => {
    const map: Record<string, string> = {
      "Новолуние": "Время новых начинаний",
      "Растущий серп": "Период роста и развития",
      "Первая четверть": "Время принятия решений",
      "Растущая луна": "Энергия накопления",
      "Полнолуние": "Пик эмоциональной активности",
      "Убывающая луна": "Время осмысления",
      "Последняя четверть": "Период завершения",
      "Убывающий серп": "Время отпускания",
    };
    return map[phase] || "Лунное влияние";
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const dateObj = new Date(selectedDate);
        
        // ПРИНУДИТЕЛЬНО очищаем кэш критических дат при каждой загрузке
        clearCriticalDatesCache();
        
        // Для критической даты 24 августа 2025 ВСЕГДА делаем новый расчет
        if (dateObj.getFullYear() === 2025 && dateObj.getMonth() === 7 && dateObj.getDate() === 24) {
          console.log('🔍 Критическая дата 24.08.2025 - ПРИНУДИТЕЛЬНО делаем новый расчет через SwissEph...');
          
          // Принудительно очищаем кэш для этой даты
          await clearMoonDataCacheForDate(dateStr);
          console.log('🗑️ Кэш для 24.08.2025 очищен');
          
          // Делаем новый расчет через SwissEph напрямую
          try {
            const { calculateMoonPhaseWithSwissEph } = await import('@/lib/moonCalculations');
            const newData = await calculateMoonPhaseWithSwissEph(dateStr);
            if (!cancelled) {
              setMoonData(newData);
              console.log('✅ Новые данные SwissEph для 24.08.2025:', newData);
            }
            return; // Выходим, НЕ используя getMoonData вообще
          } catch (swissError) {
            console.error('❌ SwissEph не сработал для 24.08.2025:', swissError);
            // Для критической даты НЕ используем fallback, показываем ошибку
            if (!cancelled) {
              setMoonData({
                phase: 'Ошибка расчета',
                phaseEmoji: '⚠️',
                sign: 'Ошибка',
                signEmoji: '⚠️',
                illumination: 0
              });
            }
            return;
          }
        }
        
        // Обычная загрузка для остальных дат
        const data = await getMoonData(dateStr);
        if (!cancelled) setMoonData(data as MoonData);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  // Предварительно подсвечиваем полнолуние/новолуние в видимом месяце
  useEffect(() => {
    let cancelled = false;
    const loadMonthMarks = async () => {
      const first = new Date(month.getFullYear(), month.getMonth(), 1);
      const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const fm = new Set<string>();
      const nm = new Set<string>();
      for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
        const dateStr = format(d, "yyyy-MM-dd");
        try {
          const data = await getMoonData(dateStr);
          if (!data) continue;
          if ((data as MoonData).phase === "Полнолуние") fm.add(format(d, "yyyy-MM-dd"));
          if ((data as MoonData).phase === "Новолуние") nm.add(format(d, "yyyy-MM-dd"));
        } catch {}
      }
      if (!cancelled) {
        setFullMoons(fm);
        setNewMoons(nm);
      }
    };
    loadMonthMarks();
    return () => {
      cancelled = true;
    };
  }, [month]);

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-background border border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Moon className="mr-3 h-6 w-6 text-primary" />
          Астро-календарь
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl p-2 bg-background/60 border border-border/50">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => d && setSelectedDate(d)}
            locale={ru}
            month={month}
            onMonthChange={setMonth}
            modifiers={{
              fullMoon: (date: Date) => fullMoons.has(format(date, "yyyy-MM-dd")),
              newMoon: (date: Date) => newMoons.has(format(date, "yyyy-MM-dd")),
            }}
            modifiersClassNames={{
              fullMoon:
                "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-red-500/80",
              newMoon:
                "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-slate-900",
            } as any}
            className="mx-auto"
          />
        </div>

        <div className="space-y-4">
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 rounded-t-xl" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Дата</p>
                <p className="text-lg font-semibold">{format(selectedDate, "d MMMM yyyy", { locale: ru })}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700">
                  {moonData?.sign ?? "—"}
                </Badge>
                <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700">
                  {moonData?.phase ?? "—"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="rounded-lg bg-white/60 dark:bg-black/20 border border-border/40 p-3">
                <p className="text-xs text-muted-foreground">Знак Луны</p>
                <p className="text-sm font-semibold flex items-center gap-2">
                  <span>{moonData?.signEmoji}</span>
                  <span>{moonData?.sign ?? "—"}</span>
                </p>
              </div>
              <div className="rounded-lg bg-white/60 dark:bg-black/20 border border-border/40 p-3">
                <p className="text-xs text-muted-foreground">Фаза</p>
                <p className="text-sm font-semibold flex items-center gap-2">
                  <span>{moonData?.phaseEmoji}</span>
                  <span>{moonData?.phase ?? "—"}</span>
                </p>
              </div>
              <div className="rounded-lg bg-white/60 dark:bg-black/20 border border-border/40 p-3">
                <p className="text-xs text-muted-foreground">Освещённость</p>
                <p className="text-sm font-semibold">{moonData ? `${moonData.illumination}%` : "—"}</p>
              </div>
              <div className="rounded-lg bg-white/60 dark:bg-black/20 border border-border/40 p-3">
                <p className="text-xs text-muted-foreground">Значение дня</p>
                <p className="text-sm font-medium leading-relaxed">
                  {moonData ? getMoonPhaseDescription(moonData.phase) : "—"}
                </p>
              </div>
            </div>

            {isLoading && (
              <p className="text-xs text-muted-foreground mt-3">Обновляем лунные данные…</p>
            )}
            

          </div>
        </div>
      </CardContent>
    </Card>
  );
}


