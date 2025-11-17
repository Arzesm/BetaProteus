// Упрощенный и точный расчет луны:
// - приоритет: SwissEph (через swisseph-wasm-main) для Москвы
// - fallback: SunCalc / упрощенные формулы, если SwissEph недоступен
import * as SunCalc from 'suncalc';

// Знаки зодиака
const zodiacSigns = [
  'Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева',
  'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы'
];

// Координаты Москвы
const MOSCOW_COORDS = {
  latitude: 55.7558,
  longitude: 37.6176,
  timezone: 3, // UTC+3
};

// Кэш для данных о луне
const moonDataCache = new Map<string, { data: MoonData; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 часа

// Lazy‑загрузка SwissEph из swisseph-wasm-main (адаптированный локальный билд)
let SwissEph: any = null;
let swissEphPromise: Promise<any> | null = null;

async function getSwissEph() {
  if (SwissEph) return SwissEph;
  if (swissEphPromise) return swissEphPromise;

  swissEphPromise = import('../../swisseph-wasm-main/src/swisseph.js').then((module) => {
    SwissEph = module.default;
    return SwissEph;
  });

  return swissEphPromise;
}

// Функция для расчета знака зодиака по долготе
function calculateZodiacSign(longitude: number): string {
  let normalizedLongitude = longitude % 360;
  if (normalizedLongitude < 0) normalizedLongitude += 360;
  
  const signIndex = Math.floor(normalizedLongitude / 30);
  return zodiacSigns[signIndex];
}

// Функция для получения эмодзи знака
export function getSignEmoji(sign: string): string {
  const signMap: { [key: string]: string } = {
    'Овен': '♈',
    'Телец': '♉',
    'Близнецы': '♊',
    'Рак': '♋',
    'Лев': '♌',
    'Дева': '♍',
    'Весы': '♎',
    'Скорпион': '♏',
    'Стрелец': '♐',
    'Козерог': '♑',
    'Водолей': '♒',
    'Рыбы': '♓'
  };
  return signMap[sign] || '⭐';
}

// Функция для получения эмодзи фазы
export function getPhaseEmoji(phase: string): string {
  const phaseMap: { [key: string]: string } = {
    'Новолуние': '🌑',
    'Растущий серп': '🌒',
    'Первая четверть': '🌓',
    'Растущая луна': '🌔',
    'Полнолуние': '🌕',
    'Убывающая луна': '🌖',
    'Последняя четверть': '🌗',
    'Убывающий серп': '🌘'
  };
  return phaseMap[phase] || '🌙';
}

// Интерфейс для данных о луне
export interface MoonData {
  phase: string;
  phaseEmoji: string;
  sign: string;
  signEmoji: string;
  illumination: number;
}

// Основная функция расчета с использованием SunCalc
export async function getMoonData(date: string, time?: string): Promise<MoonData> {
  // Проверяем кэш
  const cached = moonDataCache.get(date);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📦 Используем кэшированные данные для:', date);
    return cached.data;
  }

  try {
    // 1. Пытаемся получить точные данные через SwissEph
    const swissData = await calculateMoonPhaseWithSwissEph(date, time);
    moonDataCache.set(date, { data: swissData, timestamp: Date.now() });
    console.log('✅ Расчет луны с SwissEph:', swissData);
    return swissData;
  } catch (error) {
    console.error('❌ Ошибка SwissEph, используем SunCalc/fallback:', error);
  }

  try {
    // 2. Fallback на SunCalc (как и раньше)
    const dateObj = new Date(date);

    const moonIllum = SunCalc.getMoonIllumination(dateObj);
    const illumination = Math.round(moonIllum.fraction * 100);

    const phase = moonIllum.phase;

    let phaseName: string;
    if (phase < 0.03 || phase > 0.97) {
      phaseName = "Новолуние";
    } else if (phase < 0.22) {
      phaseName = "Растущий серп";
    } else if (phase < 0.28) {
      phaseName = "Первая четверть";
    } else if (phase < 0.47) {
      phaseName = "Растущая луна";
    } else if (phase < 0.53) {
      phaseName = "Полнолуние";
    } else if (phase < 0.72) {
      phaseName = "Убывающая луна";
    } else if (phase < 0.78) {
      phaseName = "Последняя четверть";
    } else {
      phaseName = "Убывающий серп";
    }

    // Упрощённый знак через цикл
    const lunarCycle = 27.32166;
    const knownNewMoon = new Date("2000-01-06T18:14:00Z");
    const daysSinceKnown = (dateObj.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const cyclePosition = (daysSinceKnown % lunarCycle) / lunarCycle;
    const approximateLongitude = cyclePosition * 360;
    const sign = calculateZodiacSign(approximateLongitude);

    const result: MoonData = {
      phase: phaseName,
      phaseEmoji: getPhaseEmoji(phaseName),
      sign,
      signEmoji: getSignEmoji(sign),
      illumination,
    };

    moonDataCache.set(date, { data: result, timestamp: Date.now() });
    console.log('✅ Расчет луны с SunCalc (fallback):', result);
    return result;
  } catch (error) {
    console.error('❌ Ошибка расчета луны (SunCalc), используем простой fallback:', error);
    const fallback = calculateMoonPhaseFallback(date);
    moonDataCache.set(date, { data: fallback, timestamp: Date.now() });
    return fallback;
  }
}

// Упрощенный fallback расчет
function calculateMoonPhaseFallback(date: string): MoonData {
  const selectedDate = new Date(date);
  const knownNewMoon = new Date("2000-01-06T18:14:00Z");
  const lunarCycle = 29.53058867;
  
  const diff = (selectedDate.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const age = diff % lunarCycle;
  
  const elongation = (age * 360) / 29.53058867;
  const illumination = Math.round(((1 + Math.cos((180 - elongation) * Math.PI / 180)) / 2) * 100);
  
  let phase: string;
  let phaseEmoji: string;
  
  if (age < 3.69) {
    phase = "Новолуние";
    phaseEmoji = "🌑";
  } else if (age < 7.38) {
    phase = "Растущий серп";
    phaseEmoji = "🌒";
  } else if (age < 11.07) {
    phase = "Первая четверть";
    phaseEmoji = "🌓";
  } else if (age < 14.76) {
    phase = "Растущая луна";
    phaseEmoji = "🌔";
  } else if (age < 18.45) {
    phase = "Полнолуние";
    phaseEmoji = "🌕";
  } else if (age < 22.14) {
    phase = "Убывающая луна";
    phaseEmoji = "🌖";
  } else if (age < 25.83) {
    phase = "Последняя четверть";
    phaseEmoji = "🌗";
  } else {
    phase = "Убывающий серп";
    phaseEmoji = "🌘";
  }
  
  const signIndex = Math.floor((age / 2.5) % 12);
  const sign = zodiacSigns[signIndex];
  const signEmoji = getSignEmoji(sign);
  
  return {
    phase,
    phaseEmoji,
    sign,
    signEmoji,
    illumination
  };
}

// Функции для совместимости с существующим кодом
export function calculateMoonPhase(date: string): MoonData {
  return calculateMoonPhaseFallback(date);
}

// Конвертация московского времени в UTC для SwissEph
function convertToUTC(date: string, time?: string): { year: number; month: number; day: number; hour: number } {
  const [y, m, d] = date.split('-').map((v) => parseInt(v, 10));
  const [hh, mm] = (time ?? '12:00').split(':').map((v) => parseInt(v, 10));

  let year = y;
  let month = m;
  let day = d;
  let hourLocal = isNaN(hh) ? 12 : hh;
  const minute = isNaN(mm) ? 0 : mm;

  // Переводим московское время (UTC+3) в UTC
  let hourUTC = hourLocal - MOSCOW_COORDS.timezone;

  // Обрабатываем переход через полночь
  const baseDate = new Date(Date.UTC(year, month - 1, day, hourLocal, minute));
  if (hourUTC < 0 || hourUTC >= 24) {
    const utcDate = new Date(baseDate.getTime() - MOSCOW_COORDS.timezone * 60 * 60 * 1000);
    year = utcDate.getUTCFullYear();
    month = utcDate.getUTCMonth() + 1;
    day = utcDate.getUTCDate();
    hourUTC = utcDate.getUTCHours() + utcDate.getUTCMinutes() / 60;
  } else {
    hourUTC = hourUTC + minute / 60;
  }

  return { year, month, day, hour: hourUTC };
}

// Точный расчет фазы Луны и знака через SwissEph (для Москвы)
export async function calculateMoonPhaseWithSwissEph(date: string, time?: string): Promise<MoonData> {
  const SwissEphClass = await getSwissEph();
  const swe = new SwissEphClass();
  await swe.initSwissEph();

  try {
    const { year, month, day, hour } = convertToUTC(date, time);
    const jd_ut = swe.julday(year, month, day, hour);

    const moon = swe.calc_ut(jd_ut, swe.SE_MOON, swe.SEFLG_SWIEPH);
    const sun = swe.calc_ut(jd_ut, swe.SE_SUN, swe.SEFLG_SWIEPH);

    const moonLon = moon[0];
    const sunLon = sun[0];

    // Элонгация (разность долгот)
    let elongation = moonLon - sunLon;
    if (elongation < 0) elongation += 360;

    // Освещенность по элонгации (0° — новолуние, 180° — полнолуние)
    const illumination = Math.round(((1 + Math.cos((180 - elongation) * Math.PI / 180)) / 2) * 100);

    let phase: string;
    if (elongation >= 0 && elongation < 45) {
      phase = "Новолуние";
    } else if (elongation >= 45 && elongation < 90) {
      phase = "Растущий серп";
    } else if (elongation >= 90 && elongation < 135) {
      phase = "Первая четверть";
    } else if (elongation >= 135 && elongation < 180) {
      phase = "Растущая луна";
    } else if (elongation >= 180 && elongation < 225) {
      phase = "Полнолуние";
    } else if (elongation >= 225 && elongation < 270) {
      phase = "Убывающая луна";
    } else if (elongation >= 270 && elongation < 315) {
      phase = "Последняя четверть";
    } else {
      phase = "Убывающий серп";
    }

    const sign = calculateZodiacSign(moonLon);

    return {
      phase,
      phaseEmoji: getPhaseEmoji(phase),
      sign,
      signEmoji: getSignEmoji(sign),
      illumination,
    };
  } finally {
    swe.close();
  }
}

export function clearMoonDataCache(): void {
  moonDataCache.clear();
  console.log('🗑️ Кэш очищен');
}

export function clearMoonDataCacheForDate(date: string): void {
  moonDataCache.delete(date);
  console.log(`🗑️ Кэш очищен для даты: ${date}`);
}

export function clearCriticalDatesCache(): void {
  // В упрощенной версии просто очищаем весь кэш
  clearMoonDataCache();
  console.log('🗑️ Кэш критических дат очищен');
}

export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: moonDataCache.size,
    entries: Array.from(moonDataCache.keys())
  };
}

// Экспорт для тестирования
if (typeof window !== 'undefined') {
  (window as any).testMoonPhase = async (date: string) => {
    console.log(`🧪 Тестируем лунную фазу для даты: ${date}`);
    clearMoonDataCacheForDate(date);
    const result = await getMoonData(date);
    console.log('✅ Результат:', result);
    return result;
  };
  
  (window as any).clearAllMoonCache = () => {
    clearMoonDataCache();
    console.log('✅ Весь кэш очищен');
  };
  
  (window as any).getMoonCacheInfo = () => {
    const info = getCacheStats();
    console.log('📊 Информация о кэше:', info);
    return info;
  };
}
