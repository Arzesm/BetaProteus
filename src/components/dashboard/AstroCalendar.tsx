import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ru } from "date-fns/locale";
import { format } from "date-fns";
import { Moon } from "lucide-react";
import { getMoonData, clearCriticalDatesCache, clearMoonDataCacheForDate } from "@/lib/moonCalculations";

interface MoonData {
  phase: string;
  phaseEmoji: string;
  sign: string;
  signEmoji: string;
  illumination: number;
}

// Периоды ретроградности планет (точные даты 2024-2040)
const retrogradePeriodsData = {
  mercury: [
    // 2024
    { start: '2024-04-01', end: '2024-04-25' },
    { start: '2024-08-05', end: '2024-08-28' },
    { start: '2024-11-25', end: '2024-12-15' },
    // 2025
    { start: '2025-03-15', end: '2025-04-07' },
    { start: '2025-07-18', end: '2025-08-11' },
    { start: '2025-11-09', end: '2025-11-29' },
    // 2026
    { start: '2026-02-25', end: '2026-03-20' },
    { start: '2026-06-29', end: '2026-07-23' },
    { start: '2026-10-24', end: '2026-11-13' },
    // 2027
    { start: '2027-02-09', end: '2027-03-03' },
    { start: '2027-06-10', end: '2027-07-04' },
    { start: '2027-10-07', end: '2027-10-28' },
    // 2028
    { start: '2028-01-24', end: '2028-02-14' },
    { start: '2028-05-21', end: '2028-06-13' },
    { start: '2028-09-19', end: '2028-10-11' },
    // 2029
    { start: '2029-01-07', end: '2029-01-27' },
    { start: '2029-05-02', end: '2029-05-26' },
    { start: '2029-09-02', end: '2029-09-25' },
    { start: '2029-12-22', end: '2030-01-11' },
    // 2030
    { start: '2030-04-13', end: '2030-05-07' },
    { start: '2030-08-16', end: '2030-09-08' },
    { start: '2030-12-06', end: '2030-12-26' },
    // 2031
    { start: '2031-03-28', end: '2031-04-20' },
    { start: '2031-07-29', end: '2031-08-22' },
    { start: '2031-11-20', end: '2031-12-10' },
    // 2032
    { start: '2032-03-10', end: '2032-04-02' },
    { start: '2032-07-10', end: '2032-08-03' },
    { start: '2032-11-02', end: '2032-11-22' },
    // 2033
    { start: '2033-02-22', end: '2033-03-16' },
    { start: '2033-06-21', end: '2033-07-15' },
    { start: '2033-10-16', end: '2033-11-05' },
    // 2034
    { start: '2034-02-05', end: '2034-02-27' },
    { start: '2034-06-03', end: '2034-06-27' },
    { start: '2034-09-29', end: '2034-10-20' },
    // 2035
    { start: '2035-01-19', end: '2035-02-09' },
    { start: '2035-05-14', end: '2035-06-07' },
    { start: '2035-09-12', end: '2035-10-03' },
    // 2036
    { start: '2036-01-02', end: '2036-01-22' },
    { start: '2036-04-25', end: '2036-05-19' },
    { start: '2036-08-24', end: '2036-09-16' },
    { start: '2036-12-16', end: '2037-01-05' },
    // 2037
    { start: '2037-04-07', end: '2037-05-01' },
    { start: '2037-08-07', end: '2037-08-31' },
    { start: '2037-11-30', end: '2037-12-20' },
    // 2038
    { start: '2038-03-21', end: '2038-04-13' },
    { start: '2038-07-20', end: '2038-08-13' },
    { start: '2038-11-13', end: '2038-12-03' },
    // 2039
    { start: '2039-03-04', end: '2039-03-27' },
    { start: '2039-07-02', end: '2039-07-26' },
    { start: '2039-10-27', end: '2039-11-16' },
    // 2040
    { start: '2040-02-16', end: '2040-03-09' },
    { start: '2040-06-13', end: '2040-07-07' },
    { start: '2040-10-09', end: '2040-10-30' },
  ],
  venus: [
    // 2024-2025
    { start: '2024-03-04', end: '2024-04-13' },
    { start: '2025-09-01', end: '2025-10-13' },
    // 2027
    { start: '2027-03-01', end: '2027-04-12' },
    // 2028-2029
    { start: '2028-10-02', end: '2028-11-13' },
    // 2030
    { start: '2030-03-04', end: '2030-04-15' },
    // 2031-2032
    { start: '2031-10-08', end: '2031-11-19' },
    // 2033
    { start: '2033-03-10', end: '2033-04-21' },
    // 2034-2035
    { start: '2034-10-16', end: '2034-11-27' },
    // 2036
    { start: '2036-03-17', end: '2036-04-28' },
    // 2037-2038
    { start: '2037-10-24', end: '2037-12-05' },
    // 2039
    { start: '2039-03-24', end: '2039-05-05' },
  ],
  mars: [
    // 2024-2025
    { start: '2024-12-06', end: '2025-02-24' },
    // 2027
    { start: '2027-01-11', end: '2027-04-01' },
    // 2029
    { start: '2029-02-13', end: '2029-05-03' },
    // 2031
    { start: '2031-03-05', end: '2031-05-26' },
    // 2033
    { start: '2033-04-12', end: '2033-07-01' },
    // 2035
    { start: '2035-05-04', end: '2035-07-25' },
    // 2037
    { start: '2037-06-07', end: '2037-08-27' },
    // 2039
    { start: '2039-07-11', end: '2039-09-28' },
  ],
};

// Функция для проверки, попадает ли дата в период ретроградности
const isRetrograde = (date: Date, planet: 'mercury' | 'venus' | 'mars'): boolean => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const periods = retrogradePeriodsData[planet];
  
  return periods.some(period => {
    return dateStr >= period.start && dateStr <= period.end;
  });
};

export function AstroCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [moonData, setMoonData] = useState<MoonData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [month, setMonth] = useState<Date>(new Date());
  const [fullMoons, setFullMoons] = useState<Set<string>>(new Set());
  const [newMoons, setNewMoons] = useState<Set<string>>(new Set());
  const [mercuryRetrograde, setMercuryRetrograde] = useState<Set<string>>(new Set());
  const [venusRetrograde, setVenusRetrograde] = useState<Set<string>>(new Set());
  const [marsRetrograde, setMarsRetrograde] = useState<Set<string>>(new Set());

  // При инициализации компонента очищаем кэш для критических дат
  useEffect(() => {
    const initializeCache = async () => {
      try {
        // Очищаем кэш критических дат при загрузке страницы
        console.log('🗑️ Очищаем кэш критических дат при инициализации...');
        clearCriticalDatesCache();
        console.log('✅ Кэш критических дат очищен при инициализации');
        
        // В продакшене дополнительно очищаем весь кэш за август 2025
        if (typeof window !== 'undefined' && (
          window.location.hostname.includes('vercel.app') || 
          window.location.hostname.includes('netlify.app') ||
          window.location.hostname !== 'localhost'
        )) {
          console.log('🚀 ПРОДАКШЕН: Дополнительная очистка кэша за август 2025...');
          // Очищаем кэш для всех дат августа 2025
          for (let day = 1; day <= 31; day++) {
            const date = `2025-08-${day.toString().padStart(2, '0')}`;
            clearMoonDataCacheForDate(date);
          }
          console.log('✅ ПРОДАКШЕН: Кэш за август 2025 очищен');
        }
      } catch (error) {
        console.warn('⚠️ Не удалось очистить кэш при инициализации:', error);
      }
    };
    
    initializeCache();
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

  // Предварительно подсвечиваем полнолуние/новолуние и ретроградные планеты в видимом месяце
  useEffect(() => {
    let cancelled = false;
    const loadMonthMarks = async () => {
      const first = new Date(month.getFullYear(), month.getMonth(), 1);
      const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      const fm = new Set<string>();
      const nm = new Set<string>();
      const mr = new Set<string>();
      const vr = new Set<string>();
      const mar = new Set<string>();
      
      for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
        const dateStr = format(d, "yyyy-MM-dd");
        try {
          // Проверяем лунные фазы
          const data = await getMoonData(dateStr);
          if (data) {
            if ((data as MoonData).phase === "Полнолуние") fm.add(dateStr);
            if ((data as MoonData).phase === "Новолуние") nm.add(dateStr);
          }
          
          // Проверяем ретроградные планеты
          if (isRetrograde(d, 'mercury')) mr.add(dateStr);
          if (isRetrograde(d, 'venus')) vr.add(dateStr);
          if (isRetrograde(d, 'mars')) mar.add(dateStr);
        } catch {}
      }
      
      if (!cancelled) {
        setFullMoons(fm);
        setNewMoons(nm);
        setMercuryRetrograde(mr);
        setVenusRetrograde(vr);
        setMarsRetrograde(mar);
      }
    };
    loadMonthMarks();
    return () => {
      cancelled = true;
    };
  }, [month]);

  return (
    <Card className="glass-card rounded-3xl border-none shadow-soft overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent pointer-events-none"></div>
      <CardHeader className="pb-3 relative">
        <CardTitle className="flex items-center text-lg font-semibold">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl mr-3">
            <Moon className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Лунный календарь
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 relative">
        {/* Заголовок с датой и основной информацией */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-100/50 via-cyan-100/30 to-transparent p-5 border border-blue-200/50 backdrop-blur-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 mb-1 font-medium">Выбранная дата</p>
              <p className="text-lg font-bold mb-3 text-slate-800">
                {format(selectedDate, "d MMMM yyyy", { locale: ru })}
              </p>
              
              {/* Основная информация в строку */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-blue-200/50 shadow-sm">
                  <span className="text-xl">{moonData?.phaseEmoji}</span>
                  <span className="text-sm font-semibold text-slate-700">{moonData?.phase ?? "—"}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-cyan-200/50 shadow-sm">
                  <span className="text-xl">{moonData?.signEmoji}</span>
                  <span className="text-sm font-semibold text-slate-700">{moonData?.sign ?? "—"}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-sky-200/50 shadow-sm">
                  <span className="text-xl">🌕</span>
                  <span className="text-sm font-semibold text-slate-700">{moonData ? `${moonData.illumination}%` : "—"}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Прогресс-бар освещённости */}
          {moonData && (
            <div className="mt-4">
              <div className="w-full bg-white/50 rounded-full h-2.5 overflow-hidden backdrop-blur-sm border border-blue-200/30">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-sky-400 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${moonData.illumination}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Значение дня */}
          <div className="mt-3 flex items-start gap-2">
            <span className="text-base mt-0.5">✨</span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {moonData ? getMoonPhaseDescription(moonData.phase) : "—"}
            </p>
          </div>
          
          {/* Ретроградные планеты для выбранной даты */}
          {(isRetrograde(selectedDate, 'mercury') || isRetrograde(selectedDate, 'venus') || isRetrograde(selectedDate, 'mars')) && (
            <div className="mt-4 pt-4 border-t border-blue-200/50">
              <p className="text-xs font-semibold text-slate-600 mb-2.5">Ретроградные планеты:</p>
              <div className="flex flex-wrap gap-2">
                {isRetrograde(selectedDate, 'mercury') && (
                  <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-50 to-cyan-100 text-blue-700 border-blue-200 px-3 py-1.5 rounded-xl shadow-sm">
                    ☿ Меркурий ℞
                  </Badge>
                )}
                {isRetrograde(selectedDate, 'venus') && (
                  <Badge variant="secondary" className="text-xs bg-gradient-to-r from-pink-50 to-pink-100 text-pink-700 border-pink-200 px-3 py-1.5 rounded-xl shadow-sm">
                    ♀ Венера ℞
                  </Badge>
                )}
                {isRetrograde(selectedDate, 'mars') && (
                  <Badge variant="secondary" className="text-xs bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200 px-3 py-1.5 rounded-xl shadow-sm">
                    ♂ Марс ℞
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Календарь */}
        <div className="rounded-2xl bg-white/60 backdrop-blur-sm border border-blue-200/50 p-4 shadow-sm">
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
              mercuryRetrograde: (date: Date) => mercuryRetrograde.has(format(date, "yyyy-MM-dd")),
              venusRetrograde: (date: Date) => venusRetrograde.has(format(date, "yyyy-MM-dd")),
              marsRetrograde: (date: Date) => marsRetrograde.has(format(date, "yyyy-MM-dd")),
            }}
            modifiersClassNames={{
              fullMoon:
                "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-amber-400 after:shadow-md",
              newMoon:
                "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-slate-500 after:shadow-md",
              mercuryRetrograde:
                "relative before:content-[''] before:absolute before:top-1 before:left-1/2 before:-translate-x-1/2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-blue-500 before:shadow-md",
              venusRetrograde:
                "relative before:content-[''] before:absolute before:top-1 before:right-1 before:h-1.5 before:w-1.5 before:rounded-full before:bg-pink-500 before:shadow-md",
              marsRetrograde:
                "relative before:content-[''] before:absolute before:top-1 before:left-1 before:h-1.5 before:w-1.5 before:rounded-full before:bg-red-500 before:shadow-md",
            } as any}
            className="w-full"
          />
          
          {/* Легенда */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-blue-200/50">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50">
              <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm"></div>
              <span className="text-xs text-slate-600 font-medium">Полнолуние</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gradient-to-r from-slate-50 to-gray-50">
              <div className="w-2 h-2 rounded-full bg-slate-500 shadow-sm"></div>
              <span className="text-xs text-slate-600 font-medium">Новолуние</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-sm"></div>
              <span className="text-xs text-slate-600 font-medium">☿ Меркурий</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50">
              <div className="w-2 h-2 rounded-full bg-pink-500 shadow-sm"></div>
              <span className="text-xs text-slate-600 font-medium">♀ Венера</span>
            </div>
            <div className="flex items-center gap-2 col-span-2 justify-center px-2 py-1.5 rounded-lg bg-gradient-to-r from-red-50 to-orange-50">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm"></div>
              <span className="text-xs text-slate-600 font-medium">♂ Марс</span>
            </div>
          </div>
        </div>

        {/* Индикатор загрузки */}
        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-3">
            <div className="w-4 h-4 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-600 font-medium">Обновляем данные…</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


