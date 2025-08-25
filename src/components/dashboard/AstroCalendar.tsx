import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ru } from "date-fns/locale";
import { format } from "date-fns";
import { Moon } from "lucide-react";
import { getMoonData, clearCriticalDatesCache, clearMoonDataCacheForDate, clearAllMoonDataCache } from "@/lib/moonCalculations";

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
          
          // В продакшене полностью очищаем весь кэш для обеспечения точности
          console.log('🚀 ПРОДАКШЕН: Полная очистка всего кэша...');
          clearAllMoonDataCache();
          console.log('✅ ПРОДАКШЕН: Весь кэш очищен');
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
        
        // ПРИНУДИТЕЛЬНО очищаем кэш критических дат при каждой загрузке
        clearCriticalDatesCache();
        
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
            await clearMoonDataCacheForDate(date);
          }
          console.log('✅ ПРОДАКШЕН: Кэш за август 2025 очищен');
          
          // В продакшене полностью очищаем весь кэш для обеспечения точности
          console.log('🚀 ПРОДАКШЕН: Полная очистка всего кэша...');
          clearAllMoonDataCache();
          console.log('✅ ПРОДАКШЕН: Весь кэш очищен');
        }
        
        // Для критической даты 24 августа 2025 ВСЕГДА делаем новый расчет
        if (dateObj.getFullYear() === 2025 && dateObj.getMonth() === 7 && dateObj.getDate() === 24) {
          console.log('🔍 Критическая дата 24.08.2025 - ПРИНУДИТЕЛЬНО делаем новый расчет через SwissEph...');
          
          // Принудительно очищаем кэш для этой даты
          await clearMoonDataCacheForDate(dateStr);
          console.log('🗑️ Кэш для 24.08.2025 очищен');
          
          // В продакшене дополнительно очищаем весь кэш для критических дат
          if (typeof window !== 'undefined' && (
            window.location.hostname.includes('vercel.app') || 
            window.location.hostname.includes('netlify.app') ||
            window.location.hostname !== 'localhost'
          )) {
            console.log('🚀 ПРОДАКШЕН: Дополнительная очистка кэша для критической даты...');
            clearAllMoonDataCache();
            console.log('✅ ПРОДАКШЕН: Весь кэш очищен для критической даты');
          }
          
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
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-xl font-semibold text-card-foreground">
          <Moon className="mr-3 h-5 w-5 text-primary" />
          Астро-календарь
        </CardTitle>
        {/* Кнопка для принудительной очистки кэша в продакшене */}
        {typeof window !== 'undefined' && (
          window.location.hostname.includes('vercel.app') || 
          window.location.hostname.includes('netlify.app') ||
          window.location.hostname !== 'localhost'
        ) && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-orange-500 bg-orange-100 px-2 py-1 rounded">
              🚀 Продакшен
            </span>
            <button
              onClick={() => {
                console.log('🧹 Принудительная очистка кэша...');
                clearAllMoonDataCache();
                // Перезагружаем данные
                setSelectedDate(new Date(selectedDate));
              }}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              title="Принудительно очистить кэш (для продакшена)"
            >
              🧹 Очистить кэш
            </button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {/* Календарь */}
        <div className="rounded-lg border border-border bg-card p-4 flex justify-center">
          <div className="w-full max-w-sm">
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
                  "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-2 after:w-2 after:rounded-full after:bg-red-500 after:shadow-sm",
                newMoon:
                  "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-2 after:w-2 after:rounded-full after:bg-slate-700 after:shadow-sm",
              } as any}
              className="w-full"
            />
          </div>
        </div>

        {/* Информация о луне */}
        <div className="space-y-4 min-w-0">
          {/* Заголовок с датой */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground mb-1">Выбранная дата</p>
                <p className="text-lg font-semibold text-card-foreground truncate">
                  {format(selectedDate, "d MMMM yyyy", { locale: ru })}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant="secondary" className="text-xs whitespace-nowrap">
                  {moonData?.sign ?? "—"}
                </Badge>
                <Badge variant="outline" className="text-xs whitespace-nowrap">
                  {moonData?.phase ?? "—"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Карточки с информацией */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Знак Луны */}
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-3">
                <div className="text-xl flex-shrink-0">{moonData?.signEmoji}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Знак Луны</p>
                  <p className="text-sm font-medium text-card-foreground truncate">{moonData?.sign ?? "—"}</p>
                </div>
              </div>
            </div>
            
            {/* Фаза Луны */}
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-3">
                <div className="text-xl flex-shrink-0">{moonData?.phaseEmoji}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Фаза Луны</p>
                  <p className="text-sm font-medium text-card-foreground truncate">{moonData?.phase ?? "—"}</p>
                </div>
              </div>
            </div>
            
            {/* Освещённость */}
            <div className="rounded-lg border border-border bg-card p-3 sm:col-span-2">
              <div className="flex items-center gap-3">
                <div className="text-xl flex-shrink-0">🌕</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Освещённость</p>
                  <p className="text-sm font-medium text-card-foreground mb-2">{moonData ? `${moonData.illumination}%` : "—"}</p>
                  {moonData && (
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${moonData.illumination}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Значение дня */}
            <div className="rounded-lg border border-border bg-card p-3 sm:col-span-2">
              <div className="flex items-start gap-3">
                <div className="text-xl flex-shrink-0 mt-0.5">✨</div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Значение дня</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {moonData ? getMoonPhaseDescription(moonData.phase) : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Индикатор загрузки */}
          {isLoading && (
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                <p className="text-sm text-muted-foreground">Обновляем лунные данные…</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


