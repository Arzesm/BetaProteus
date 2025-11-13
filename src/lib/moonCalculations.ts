// Упрощенный расчет луны с использованием suncalc
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
  timezone: 3
};

// Кэш для данных о луне
const moonDataCache = new Map<string, { data: MoonData; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 часа

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
  try {
    // Проверяем кэш
    const cached = moonDataCache.get(date);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 Используем кэшированные данные для:', date);
      return cached.data;
    }

    // Создаем объект даты
    const dateObj = new Date(date);
    
    // SunCalc: получаем illumination (освещенность луны)
    const moonIllum = SunCalc.getMoonIllumination(dateObj);
    const illumination = Math.round(moonIllum.fraction * 100);
    
    // SunCalc: получаем позицию луны (азимут и высоту не используем, только для расчета знака)
    const moonPos = SunCalc.getMoonPosition(dateObj, MOSCOW_COORDS.latitude, MOSCOW_COORDS.longitude);
    
    // Вычисляем элонгацию для определения фазы
    // SunCalc предоставляет phase: 0 = новолуние, 0.25 = первая четверть, 0.5 = полнолуние, 0.75 = последняя четверть
    const phase = moonIllum.phase;
    
    // Определяем название фазы
    let phaseName: string;
    let phaseEmoji: string;
    
    if (phase < 0.03 || phase > 0.97) {
      phaseName = "Новолуние";
      phaseEmoji = "🌑";
    } else if (phase < 0.22) {
      phaseName = "Растущий серп";
      phaseEmoji = "🌒";
    } else if (phase < 0.28) {
      phaseName = "Первая четверть";
      phaseEmoji = "🌓";
    } else if (phase < 0.47) {
      phaseName = "Растущая луна";
      phaseEmoji = "🌔";
    } else if (phase < 0.53) {
      phaseName = "Полнолуние";
      phaseEmoji = "🌕";
    } else if (phase < 0.72) {
      phaseName = "Убывающая луна";
      phaseEmoji = "🌖";
    } else if (phase < 0.78) {
      phaseName = "Последняя четверть";
      phaseEmoji = "🌗";
    } else {
      phaseName = "Убывающий серп";
      phaseEmoji = "🌘";
    }
    
    // Для знака зодиака используем упрощенный расчет на основе даты
    // (SunCalc не предоставляет эклиптическую долготу)
    const year = dateObj.getFullYear();
    const dayOfYear = Math.floor((dateObj.getTime() - new Date(year, 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // Луна проходит зодиак за ~27.3 дней
    const lunarCycle = 27.32166;
    const knownNewMoon = new Date("2000-01-06T18:14:00Z");
    const daysSinceKnown = (dateObj.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
    const cyclePosition = (daysSinceKnown % lunarCycle) / lunarCycle;
    
    // Определяем знак (0-360 градусов / 12 знаков = 30 градусов на знак)
    const approximateLongitude = cyclePosition * 360;
    const sign = calculateZodiacSign(approximateLongitude);
    const signEmoji = getSignEmoji(sign);
    
    const result = {
      phase: phaseName,
      phaseEmoji,
      sign,
      signEmoji,
      illumination
    };
    
    // Сохраняем в кэш
    moonDataCache.set(date, { data: result, timestamp: Date.now() });
    console.log('✅ Расчет луны с SunCalc:', result);
    
    return result;
    
  } catch (error) {
    console.error('❌ Ошибка расчета луны:', error);
    
    // Fallback на простой расчет
    return calculateMoonPhaseFallback(date);
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
