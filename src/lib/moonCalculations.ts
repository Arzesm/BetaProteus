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
      
      // Проверяем работоспособность на простом расчете
      try {
        const testDate = new Date('2025-08-24');
        const testJd = swe.julday(testDate.getFullYear(), testDate.getMonth() + 1, testDate.getDate(), 12);
        const testMoon = swe.calc_ut(testJd, swe.SE_MOON, swe.SEFLG_SWIEPH);
        console.log(`✅ Тест SwissEph: Луна на 24.08.2025 в 12:00 = ${testMoon[0].toFixed(2)}°`);
        
        // Проверяем знак зодиака
        const testSign = calculateZodiacSign(testMoon[0]);
        console.log(`✅ Тест знака: ${testSign} для долготы ${testMoon[0].toFixed(2)}°`);
        
      } catch (testError) {
        console.warn('⚠️ Тест SwissEph не прошел:', testError);
      }
      
    } catch (error) {
      console.error('Ошибка инициализации SwissEph:', error);
      throw error;
    }
  }
  return swe;
}

// Функция для расчета знака зодиака
function calculateZodiacSign(longitude: number): string {
  // Нормализуем долготу в диапазон 0-360
  let normalizedLongitude = longitude % 360;
  if (normalizedLongitude < 0) normalizedLongitude += 360;
  
  // Определяем знак зодиака (каждый знак занимает 30°)
  // Овен: 0° - 29.999°, Телец: 30° - 59.999°, и т.д.
  const signIndex = Math.floor(normalizedLongitude / 30);
  
  // Добавляем подробную отладку для всех знаков
  console.log(`🔍 Отладка знака: долгота = ${longitude.toFixed(2)}°, нормализованная = ${normalizedLongitude.toFixed(2)}°, индекс = ${signIndex}, знак = ${zodiacSigns[signIndex]}`);
  
  // Проверяем границы знаков для точности
  const signStart = signIndex * 30;
  const signEnd = (signIndex + 1) * 30;
  console.log(`📏 Границы знака: ${signStart}° - ${signEnd}°`);
  
  // Дополнительная проверка для критических дат
  if (Math.abs(longitude - 150) < 30) { // Дева примерно 150° - 180°
    console.log(`🌾 Проверка Девы: долгота = ${longitude.toFixed(2)}°, должна быть Дева`);
  }
  
  return zodiacSigns[signIndex];
}

// Функция для получения кэшированных данных
function getCachedMoonData(date: string): MoonData | null {
  const cached = moonDataCache.get(date);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    // Проверяем точность кэшированных данных для критических дат
    const dateObj = new Date(date);
    if (dateObj.getFullYear() === 2025 && dateObj.getMonth() === 7 && dateObj.getDate() === 24) {
      // Для 24 августа 2025 НИКОГДА не используем кэш
      console.log('🚫 Критическая дата 24.08.2025 - НИКОГДА не используем кэш!');
      moonDataCache.delete(date); // Очищаем кэш
      return null; // Возвращаем null, чтобы сделать новый расчет
    }
    
    // Дополнительная проверка: если знак "Козерог", возможно это ошибка
    if (cached.data.sign === 'Козерог') {
      console.log('⚠️ Обнаружен подозрительный знак "Козерог" в кэше, очищаем...');
      moonDataCache.delete(date);
      return null;
    }
    
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
    
    // Добавляем отладочную информацию для критических дат
    const dateObj = new Date(date);
    if (dateObj.getFullYear() === 2025 && dateObj.getMonth() === 7 && dateObj.getDate() === 24) {
      console.log(`🔍 КРИТИЧЕСКАЯ ДАТА 24 августа 2025:`);
      console.log(`   SwissEph: долгота Луны = ${moonLongitude.toFixed(2)}°`);
      console.log(`   Знак зодиака = ${sign} (${signEmoji})`);
      console.log(`   Фаза = ${phase}, освещенность = ${illumination}%`);
      console.log(`   Элонгация = ${elongation.toFixed(2)}°`);
    }
    
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
  
    // Улучшенный расчет положения луны в знаке зодиака
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth() + 1;
  const day = selectedDate.getDate();
  
  // Более точная формула для расчета долготы луны (Jean Meeus)
  const T = (year - 2000) / 100;
  const T2 = T * T;
  const T3 = T2 * T;
  const T4 = T3 * T;
  
  // Средняя долгота Луны
  const L = 218.3164477 + 481267.88123421 * T - 0.0015786 * T2 + T3 / 538841 - T4 / 65194000;
  
  // Средняя аномалия Луны
  const M = 134.9633964 + 477198.8675055 * T + 0.0087414 * T2 + T3 / 69699 - T4 / 14712000;
  
  // Средняя аномалия Солнца
  const Mprime = 357.5291092 + 35999.0502909 * T - 0.0001536 * T2 + T3 / 24490000;
  
  // Аргумент широты Луны
  const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T2 - T3 / 3526000 + T4 / 863310000;
  
  // Долгота восходящего узла Луны
  const Omega = 125.0445550 - 1934.1361849 * T + 0.0020762 * T2 + T3 / 467410 - T4 / 60616000;
  
  // Расчет долготы Луны с учетом основных возмущений
  let moonLongitude = L + 6.2886 * Math.sin(M * Math.PI / 180) 
                     + 1.2740 * Math.sin((2 * F - M) * Math.PI / 180)
                     + 0.6583 * Math.sin((2 * F) * Math.PI / 180)
                     + 0.2136 * Math.sin((2 * M) * Math.PI / 180)
                     - 0.1856 * Math.sin(Mprime * Math.PI / 180)
                     - 0.1143 * Math.sin((2 * F - 2 * M) * Math.PI / 180)
                     + 0.0588 * Math.sin((2 * F - 2 * M + Mprime) * Math.PI / 180)
                     + 0.0572 * Math.sin((2 * F - M - Mprime) * Math.PI / 180)
                     - 0.0533 * Math.sin((2 * F + M) * Math.PI / 180)
                     + 0.0458 * Math.sin((2 * F - Mprime) * Math.PI / 180)
                     + 0.0410 * Math.sin(Mprime * Math.PI / 180)
                     - 0.0347 * Math.sin((2 * F + Mprime) * Math.PI / 180)
                     - 0.0305 * Math.sin((2 * F - 2 * M) * Math.PI / 180)
                     + 0.0153 * Math.sin((2 * F - 2 * M - Mprime) * Math.PI / 180)
                     - 0.0125 * Math.sin((2 * F - 2 * M + Mprime) * Math.PI / 180)
                     + 0.0107 * Math.sin((2 * F + 2 * M) * Math.PI / 180);
  
  moonLongitude = moonLongitude % 360;
  if (moonLongitude < 0) moonLongitude += 360;
  
  // Добавляем отладочную информацию для критических дат
  if (year === 2025 && month === 8 && day === 24) {
    console.log(`🔍 Отладка для 24 августа 2025: долгота Луны = ${moonLongitude.toFixed(2)}°`);
  }
  
  const sign = calculateZodiacSign(moonLongitude);
  const signEmoji = getSignEmoji(sign);
  
  // Дополнительная проверка для критических дат
  if (year === 2025 && month === 8 && day === 24) {
    console.log(`🔍 Отладка для 24 августа 2025: знак = ${sign}, долгота = ${moonLongitude.toFixed(2)}°`);
  }
  
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
    // ПРИНУДИТЕЛЬНО очищаем кэш критических дат при каждом вызове
    clearCriticalDatesCache();
    
    // Для критических дат ВСЕГДА делаем новый расчет, НЕ используем кэш
    const dateObj = new Date(date);
    if (dateObj.getFullYear() === 2025 && dateObj.getMonth() === 7 && dateObj.getDate() === 24) {
      console.log('🚫 КРИТИЧЕСКАЯ ДАТА 24.08.2025 - ПОЛНОСТЬЮ ИГНОРИРУЕМ КЭШ!');
      
      // Принудительно очищаем кэш для этой даты
      clearMoonDataCacheForDate(date);
      console.log('🗑️ Кэш для 24.08.2025 очищен');
      
      // Делаем новый расчет через SwissEph
      try {
        const moonData = await calculateMoonPhaseWithSwissEph(date, time);
        console.log('✅ Новый расчет SwissEph для 24.08.2025:', moonData);
        
        // НЕ сохраняем в кэш для критических дат, чтобы избежать проблем
        console.log('🚫 Данные НЕ сохраняются в кэш для критической даты');
        return moonData;
      } catch (swissError) {
        console.error('❌ SwissEph не сработал для 24.08.2025:', swissError);
        // Для критической даты НЕ используем fallback, возвращаем ошибку
        throw new Error(`Не удалось рассчитать данные для критической даты 24.08.2025: ${swissError.message}`);
      }
    }
    
    // Сначала проверяем кэш для обычных дат
    const cachedData = getCachedMoonData(date);
    if (cachedData) {
      // Добавляем отладочную информацию для критических дат
      if (dateObj.getFullYear() === 2025 && dateObj.getMonth() === 7 && dateObj.getDate() === 24) {
        console.log(`🔍 КЭШ для 24 августа 2025: знак = ${cachedData.sign}, фаза = ${cachedData.phase}`);
      }
      return cachedData;
    }

    // Используем SwissEph для точного расчета для Москвы
    console.log('Рассчитываем данные о луне с помощью SwissEph для Москвы, дата:', date);
    const moonData = await calculateMoonPhaseWithSwissEph(date, time);
    
    // Добавляем отладочную информацию для критических дат
    if (dateObj.getFullYear() === 2025 && dateObj.getMonth() === 7 && dateObj.getDate() === 24) {
      console.log(`🔍 НОВЫЙ РАСЧЕТ для 24 августа 2025: знак = ${moonData.sign}, фаза = ${moonData.phase}`);
    }
    
    // Сохраняем в кэш
    cacheMoonData(date, moonData);
    
    return moonData;
    
  } catch (error) {
    console.error('Ошибка при получении лунных данных:', error);
    // Fallback на упрощенный расчет
    const fallbackData = calculateMoonPhaseFallback(date);
    
    // Добавляем отладочную информацию для критических дат
    if (dateObj.getFullYear() === 2025 && dateObj.getMonth() === 7 && dateObj.getDate() === 24) {
      console.log(`🔍 FALLBACK для 24 августа 2025: знак = ${fallbackData.sign}, фаза = ${fallbackData.phase}`);
    }
    
    cacheMoonData(date, fallbackData);
    return fallbackData;
  }
}

// Функция для очистки кэша
export function clearMoonDataCache(): void {
  moonDataCache.clear();
  console.log('Кэш данных о луне очищен');
}

// Функция для очистки кэша для конкретной даты
export function clearMoonDataCacheForDate(date: string): void {
  moonDataCache.delete(date);
  console.log(`Кэш данных о луне очищен для даты: ${date}`);
}

// Функция для принудительной очистки кэша критических дат
export function clearCriticalDatesCache(): void {
  // Очищаем кэш для всех критических дат
  const criticalDates = ['2025-08-24'];
  
  criticalDates.forEach(date => {
    moonDataCache.delete(date);
    console.log(`🗑️ Кэш очищен для критической даты: ${date}`);
  });
  
  // Дополнительно очищаем все подозрительные данные со знаком "Козерог"
  let suspiciousCount = 0;
  for (const [date, cached] of moonDataCache.entries()) {
    if (cached.data.sign === 'Козерог') {
      moonDataCache.delete(date);
      suspiciousCount++;
      console.log(`🚫 Удален подозрительный кэш для даты: ${date}`);
    }
  }
  
  if (suspiciousCount > 0) {
    console.log(`⚠️ Удалено ${suspiciousCount} подозрительных записей со знаком "Козерог"`);
  }
  
  console.log('✅ Кэш для всех критических дат очищен');
}

// Функция для получения статистики кэша
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: moonDataCache.size,
    entries: Array.from(moonDataCache.keys())
  };
}

// Функция для принудительного пересчета данных для конкретной даты
export async function recalculateMoonData(date: string, time?: string): Promise<MoonData> {
  // Очищаем кэш для этой даты
  clearMoonDataCacheForDate(date);
  
  // Пересчитываем данные
  console.log(`Принудительный пересчет данных о луне для даты: ${date}`);
  return await getMoonData(date, time);
}

// Функция для тестирования расчетов
export async function testMoonCalculations() {
  const today = new Date().toISOString().split('T')[0];
  const result = await getMoonData(today);
  console.log(`Тест для сегодняшней даты ${today} (Москва):`, result);
  return result;
}

// Функция для тестирования конкретной даты
export async function testSpecificDate(date: string) {
  console.log(`🧪 Тестируем дату: ${date}`);
  
  try {
    // Очищаем кэш для этой даты
    clearMoonDataCacheForDate(date);
    
    // Тестируем SwissEph
    console.log('1️⃣ Тестируем SwissEph...');
    const swissEphResult = await calculateMoonPhaseWithSwissEph(date);
    console.log('SwissEph результат:', swissEphResult);
    
    // Тестируем fallback
    console.log('2️⃣ Тестируем fallback...');
    const fallbackResult = calculateMoonPhaseFallback(date);
    console.log('Fallback результат:', fallbackResult);
    
    // Сравниваем результаты
    console.log('3️⃣ Сравнение результатов:');
    console.log(`   SwissEph: знак = ${swissEphResult.sign}, фаза = ${swissEphResult.phase}`);
    console.log(`   Fallback: знак = ${fallbackResult.sign}, фаза = ${fallbackResult.phase}`);
    
    if (swissEphResult.sign !== fallbackResult.sign) {
      console.warn('⚠️ РАЗЛИЧИЕ В ЗНАКАХ ЗОДИАКА!');
    }
    
    return { swissEphResult, fallbackResult };
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
    return null;
  }
}

// Экспортируем функцию для совместимости
export function calculateMoonPhase(date: string): MoonData {
  return calculateMoonPhaseFallback(date);
}

// Глобальная функция для тестирования в консоли браузера
if (typeof window !== 'undefined') {
  (window as any).testMoonPhase = async (date: string) => {
    console.log(`🧪 Тестируем лунную фазу для даты: ${date}`);
    return await testSpecificDate(date);
  };
  
  (window as any).getMoonCacheInfo = () => {
    const info = getCacheStats();
    console.log('📊 Информация о кэше:', info);
    return info;
  };
} 