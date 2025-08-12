import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Знаки зодиака
const zodiacSigns = [
  'Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева',
  'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы'
];

// Фазы Луны
const moonPhases = [
  'Новолуние', 'Растущий серп', 'Первая четверть', 'Растущая Луна',
  'Полнолуние', 'Убывающая Луна', 'Последняя четверть', 'Убывающий серп'
];

// Функция для расчета фазы Луны
function calculateMoonPhase(julianDay: number): { phase: string; illumination: number } {
  // Упрощенный расчет фазы Луны
  const T = (julianDay - 2451545.0) / 36525;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868 - T * T * T * T / 113065000;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000;
  const Mprime = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699 - T * T * T * T / 14712000;
  
  const phase = (D - Mprime) % 360;
  const illumination = (1 + Math.cos(phase * Math.PI / 180)) / 2;
  
  let phaseName = '';
  if (illumination < 0.125) phaseName = 'Новолуние';
  else if (illumination < 0.25) phaseName = 'Растущий серп';
  else if (illumination < 0.375) phaseName = 'Первая четверть';
  else if (illumination < 0.5) phaseName = 'Растущая Луна';
  else if (illumination < 0.625) phaseName = 'Полнолуние';
  else if (illumination < 0.75) phaseName = 'Убывающая Луна';
  else if (illumination < 0.875) phaseName = 'Последняя четверть';
  else phaseName = 'Убывающий серп';
  
  return { phase: phaseName, illumination: Math.round(illumination * 100) };
}

// Функция для расчета знака зодиака
function calculateZodiacSign(longitude: number): string {
  const signIndex = Math.floor(longitude / 30);
  return zodiacSigns[signIndex];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { date } = await req.json();
    if (!date) {
      return new Response(JSON.stringify({ error: 'Необходимо указать дату.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Парсим дату
    const dreamDate = new Date(date);
    const year = dreamDate.getFullYear();
    const month = dreamDate.getMonth() + 1;
    const day = dreamDate.getDate();
    
    // Упрощенный расчет юлианского дня
    const julianDay = 367 * year - Math.floor(7 * (year + Math.floor((month + 9) / 12)) / 4) + 
                     Math.floor(275 * month / 9) + day + 1721013.5;
    
    // Упрощенный расчет положения Луны (примерные значения)
    const moonLongitude = (julianDay * 13.1764) % 360;
    const moonSign = calculateZodiacSign(moonLongitude);
    const moonPhase = calculateMoonPhase(julianDay);
    
    const moonData = {
      sign: moonSign,
      phase: moonPhase.phase,
      illumination: moonPhase.illumination,
      longitude: Math.round(moonLongitude * 100) / 100
    };

    return new Response(JSON.stringify({ moonData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Ошибка в серверной функции:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}) 