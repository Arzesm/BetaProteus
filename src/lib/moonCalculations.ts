import SwissEph from 'swisseph-wasm';

// Ensure Vite can resolve WASM and data files paths when bundling
// @ts-ignore - hint to Emscripten loader used by swisseph-wasm
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
(globalThis as any).Module = (globalThis as any).Module || {};
// @ts-ignore
(globalThis as any).Module.locateFile = (path: string, prefix: string) => {
  // Vite serves assets from root; allow resolving .wasm and .data under the built assets
  // If path already absolute, return as is
  if (path.startsWith('http') || path.startsWith('/') || path.startsWith('data:')) return path;
  // Delegate to default behavior for non-wasm files
  if (!path.endsWith('.wasm') && !path.endsWith('.data')) return `${prefix}${path}`;
  return `/${path}`;
};

// Знаки зодиака
const zodiacSigns = [
  'Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева',
  'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы'
];

// Координаты Москвы
const MOSCOW_COORDS = {
  latitude: 55.7558,  // Широта Москвы
  longitude: 37.6176, // Долгота Москвы
  timezone: 3         // Часовой пояс Москвы (UTC+3)
};

// Кэш для данных о луне
const moonDataCache = new Map<string, { data: MoonData; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 часа в миллисекундах

// Глобальный экземпляр SwissEph
let swe: SwissEph | null = null;
let initialized = false;

// Инициализация SwissEph
async function initSwissEph() {
  if (!initialized) {
    try {
      console.log('Инициализация SwissEph...');
      swe = new SwissEph();
      await swe.initSwissEph();
      initialized = true;
      console.log('SwissEph успешно инициализирован');
    } catch (error) {
      console.error('Ошибка инициализации SwissEph:', error);
      throw error;
    }
  }
  return swe;
}

// Функция для расчета знака зодиака
function calculateZodiacSign(longitude: number): string {
  const signIndex = Math.floor(longitude / 30);
  return zodiacSigns[signIndex];
}

// Функция для получения кэшированных данных
function getCachedMoonData(date: string): MoonData | null {
  const cached = moonDataCache.get(date);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Используем кэшированные данные для даты:', date);
    return cached.data;
  }
  return null;
}

// Функция для сохранения данных в кэш
function cacheMoonData(date: string, data: MoonData): void {
  moonDataCache.set(date, { data, timestamp: Date.now() });
  console.log('Данные сохранены в кэш для даты:', date);
}

// Функция для конвертации местного времени в UTC
function convertToUTC(date: string, time?: string): { year: number; month: number; day: number; hour: number; minute: number } {
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  
  // Если время не указано, используем полдень по московскому времени
  let hour = 12;
  let minute = 0;
  
  if (time) {
    const timeParts = time.split(':');
    hour = parseInt(timeParts[0]) || 12;
    minute = parseInt(timeParts[1]) || 0;
  }
  
  // Конвертируем московское время в UTC
  let utcHour = hour - MOSCOW_COORDS.timezone;
  let utcDay = day;
  let utcMonth = month;
  let utcYear = year;
  
  // Обработка перехода через полночь
  if (utcHour < 0) {
    utcHour += 24;
    utcDay--;
    if (utcDay < 1) {
      utcMonth--;
      if (utcMonth < 1) {
        utcMonth = 12;
        utcYear--;
      }
      // Простая логика для определения количества дней в месяце
      const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      utcDay = daysInMonth[utcMonth - 1];
    }
  }
  
  return { year: utcYear, month: utcMonth, day: utcDay, hour: utcHour, minute };
}

// Функция для расчета лунной фазы с помощью SwissEph для Москвы
export async function calculateMoonPhaseWithSwissEph(date: string, time?: string): Promise<MoonData> {
  try {
    const swe = await initSwissEph();
    
    // Конвертируем московское время в UTC
    const utcTime = convertToUTC(date, time);
    console.log(`Рассчитываем для Москвы: ${date} ${time || '12:00'} (UTC: ${utcTime.year}-${utcTime.month}-${utcTime.day} ${utcTime.hour}:${utcTime.minute})`);
    
    // Конвертируем в юлианский день
    const julianDay = swe.julday(utcTime.year, utcTime.month, utcTime.day, utcTime.hour + utcTime.minute / 60);
    
    // Получаем позицию Луны (SE_MOON = 1)
    const moonPosition = swe.calc_ut(julianDay, swe.SE_MOON, swe.SEFLG_SWIEPH);
    const moonLongitude = moonPosition[0];
    
    // Получаем позицию Солнца (SE_SUN = 0)
    const sunPosition = swe.calc_ut(julianDay, swe.SE_SUN, swe.SEFLG_SWIEPH);
    const sunLongitude = sunPosition[0];
    
    // Рассчитываем лунную фазу
    // Разность долгот (элонгация)
    let elongation = moonLongitude - sunLongitude;
    if (elongation < 0) elongation += 360;
    
         // Рассчитываем точную освещенность Луны
     // Формула: illumination = (1 + cos((180 - elongation) * π / 180)) / 2 * 100
     // При элонгации 0° (новолуние) = 0%, при элонгации 180° (полнолуние) = 100%
     const illumination = Math.round(((1 + Math.cos((180 - elongation) * Math.PI / 180)) / 2) * 100);
     
     // Определяем фазу луны на основе элонгации
     let phase: string;
     let phaseEmoji: string;
     
     if (elongation < 45) {
       phase = "Новолуние";
       phaseEmoji = "🌑";
     } else if (elongation < 90) {
       phase = "Растущий серп";
       phaseEmoji = "🌒";
     } else if (elongation < 135) {
       phase = "Первая четверть";
       phaseEmoji = "🌓";
     } else if (elongation < 180) {
       phase = "Растущая луна";
       phaseEmoji = "🌔";
     } else if (elongation < 225) {
       phase = "Полнолуние";
       phaseEmoji = "🌕";
     } else if (elongation < 270) {
       phase = "Убывающая луна";
       phaseEmoji = "🌖";
     } else if (elongation < 315) {
       phase = "Последняя четверть";
       phaseEmoji = "🌗";
     } else {
       phase = "Убывающий серп";
       phaseEmoji = "🌘";
     }
    
    // Определяем знак зодиака Луны
    const sign = calculateZodiacSign(moonLongitude);
    const signEmoji = getSignEmoji(sign);
    
         console.log(`Москва: Луна в знаке ${sign} (${moonLongitude.toFixed(2)}°), фаза: ${phase}, освещенность: ${illumination}%, элонгация: ${elongation.toFixed(2)}°`);
    
    return {
      phase,
      phaseEmoji,
      sign,
      signEmoji,
      illumination
    };
    
  } catch (error) {
    console.error('Ошибка расчета с SwissEph:', error);
    // Fallback на упрощенный расчет
    return calculateMoonPhaseFallback(date);
  }
}

// Упрощенный расчет лунных фаз (fallback)
function calculateMoonPhaseFallback(date: string): MoonData {
  const selectedDate = new Date(date);
  const knownNewMoon = new Date("2000-01-06T18:14:00Z"); // эталонное новолуние
  const lunarCycle = 29.53058867; // дней в лунном цикле
  
  const diff = (selectedDate.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const age = diff % lunarCycle;
  
     // Рассчитываем точную освещенность Луны на основе возраста
   // Преобразуем возраст в элонгацию: age * 360 / 29.53058867
   const elongation = (age * 360) / 29.53058867;
   // Формула: illumination = (1 + cos((180 - elongation) * π / 180)) / 2 * 100
   // При элонгации 0° (новолуние) = 0%, при элонгации 180° (полнолуние) = 100%
   const illumination = Math.round(((1 + Math.cos((180 - elongation) * Math.PI / 180)) / 2) * 100);
   
   // Определяем фазу луны
   let phase: string;
   let phaseEmoji: string;
   
   if (age < 1.84566) {
     phase = "Новолуние";
     phaseEmoji = "🌑";
   } else if (age < 5.53699) {
     phase = "Растущий серп";
     phaseEmoji = "🌒";
   } else if (age < 9.22831) {
     phase = "Первая четверть";
     phaseEmoji = "🌓";
   } else if (age < 12.91963) {
     phase = "Растущая луна";
     phaseEmoji = "🌔";
   } else if (age < 16.61096) {
     phase = "Полнолуние";
     phaseEmoji = "🌕";
   } else if (age < 20.30228) {
     phase = "Убывающая луна";
     phaseEmoji = "🌖";
   } else if (age < 23.99361) {
     phase = "Последняя четверть";
     phaseEmoji = "🌗";
   } else if (age < 27.68493) {
     phase = "Убывающий серп";
     phaseEmoji = "🌘";
   } else {
     phase = "Новолуние";
     phaseEmoji = "🌑";
   }
  
  // Упрощенный расчет положения луны в знаке зодиака
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  const day = selectedDate.getDate();
  
  // Простая формула для расчета долготы луны
  const T = (year - 2000) / 100;
  const L = 218.3164477 + 481267.88123421 * T + 0.0015786 * T * T;
  const M = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T;
  const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T;
  
  let moonLongitude = L + 6.2886 * Math.sin(M * Math.PI / 180) + 1.2740 * Math.sin((2 * F - M) * Math.PI / 180);
  moonLongitude = moonLongitude % 360;
  if (moonLongitude < 0) moonLongitude += 360;
  
  const sign = calculateZodiacSign(moonLongitude);
  const signEmoji = getSignEmoji(sign);
  
  return {
    phase,
    phaseEmoji,
    sign,
    signEmoji,
    illumination
  };
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

// Основная функция для получения лунных данных для Москвы
export async function getMoonData(date: string, time?: string): Promise<MoonData> {
  try {
    // Сначала проверяем кэш
    const cachedData = getCachedMoonData(date);
    if (cachedData) {
      return cachedData;
    }

    // Используем SwissEph для точного расчета для Москвы
    console.log('Рассчитываем данные о луне с помощью SwissEph для Москвы, дата:', date);
    const moonData = await calculateMoonPhaseWithSwissEph(date, time);
    
    // Сохраняем в кэш
    cacheMoonData(date, moonData);
    
    return moonData;
    
  } catch (error) {
    console.error('Ошибка при получении лунных данных:', error);
    // Fallback на упрощенный расчет
    const fallbackData = calculateMoonPhaseFallback(date);
    cacheMoonData(date, fallbackData);
    return fallbackData;
  }
}

// Функция для очистки кэша
export function clearMoonDataCache(): void {
  moonDataCache.clear();
  console.log('Кэш данных о луне очищен');
}

// Функция для получения статистики кэша
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: moonDataCache.size,
    entries: Array.from(moonDataCache.keys())
  };
}

// Функция для тестирования расчетов
export async function testMoonCalculations() {
  const today = new Date().toISOString().split('T')[0];
  const result = await getMoonData(today);
  console.log(`Тест для сегодняшней даты ${today} (Москва):`, result);
  return result;
}

// Экспортируем функцию для совместимости
export function calculateMoonPhase(date: string): MoonData {
  return calculateMoonPhaseFallback(date);
} 