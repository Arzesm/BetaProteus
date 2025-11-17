import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Ключ OpenAI API не настроен на сервере.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  try {
    const { natalChart, transits } = await req.json();
    if (!natalChart || !transits) {
      return new Response(JSON.stringify({ error: 'Необходимо указать данные натальной карты и транзитов.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const chartSummary = `
      - Солнце в знаке ${natalChart.planets.find((p: any) => p.name === 'Солнце')?.sign}
      - Луна в знаке ${natalChart.planets.find((p: any) => p.name === 'Луна')?.sign}
      - Асцендент в знаке ${natalChart.ascendant.sign}
    `;

    const transitsSummary = transits.map((t: any) => 
      `Транзитная планета ${t.transitingPlanet} делает аспект ${t.aspectName} к натальной планете ${t.natalPlanet}`
    ).join('.\n');

    const systemPrompt = `Ты — Протей, мудрый и добрый астролог. Твоя задача — дать человеку ясный, практичный прогноз на день простым и понятным русским языком.

**КРИТИЧЕСКИ ВАЖНО:**
- ЖЁСТКО ОГРАНИЧИ ОБЪЁМ: 100–150 слов. НЕ БОЛЬШЕ 150 СЛОВ.
- Пиши живым, разговорным, но уважительным стилем.
- Текст должен быть цельным и логично завершённым, без обрыва мыслей.

**ФИКСИРОВАННАЯ СТРУКТУРА ОТВЕТА (ИСПОЛЬЗУЙ РОВНО ЭТУ РАЗМЕТКУ):**
**Атмосфера дня**
- 1–2 коротких предложения о общем настроении и энергиях дня.

**Что делать сегодня**
- 2–3 конкретных действия в формате глаголов: что СТОИТ сделать, на чём сосредоточиться.

**Чего не делать сегодня**
- 2–3 конкретных запрета/ограничения: чего лучше избегать, где не торопиться, чего не обострять.

**Совет дня**
- 1–2 предложения с простым, практическим советом, как прожить этот день мягче и полезнее.

**ПРАВИЛА:**
- Обращайся на "вы".
- НЕ используй астрологический жаргон и технические термины (транзит, аспект, квадратура, натальный и т.п.).
- Объясняй всё через психологию, ощущения и реальные жизненные ситуации.
- Обязательно укажи, если есть потенциально напряжённые моменты, и мягко объясни, как с ними справиться.

Вот данные для анализа:`;
    
    const userPrompt = `
Краткая сводка натальной карты:
${chartSummary}

Ключевые транзиты на сегодня:
${transitsSummary}

Напиши прогноз на день для этого человека.`;

    const requestBody = {
      model: "gpt-5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 260,
      temperature: 0.7,
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok || !data.choices || data.choices.length === 0) {
      console.error('OpenAI API Error:', data);
      const errorMessage = data.error?.message || 'Ошибка при получении ответа от OpenAI.';
       return new Response(JSON.stringify({ error: errorMessage }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      });
    }

    let interpretation = data.choices[0].message.content;

    // Мягкий серверный контроль объёма: если сильно вышли за пределы, просим модель переписать
    const countWords = (s: string) =>
      (s || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

    const wc = countWords(interpretation);

    if (wc > 150) {
      const strictSystem = `${systemPrompt}

ВНИМАНИЕ: предыдущий ответ был слишком длинным (${wc} слов). Перепиши прогноз так, чтобы он содержал 100–150 слов, не больше 150, сохранив ту же структуру заголовков и буллитов. НЕ обрывай фразы — текст должен оставаться цельным и завершённым.`;

      const retryBody = {
        model: "gpt-5",
        messages: [
          { role: "system", content: strictSystem },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 260,
        temperature: 0.7,
      };

      const retryResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(retryBody),
      });

      const retryData = await retryResponse.json();
      if (retryResponse.ok && retryData.choices && retryData.choices.length > 0) {
        interpretation = retryData.choices[0].message.content;
      }
    }
        
    return new Response(JSON.stringify({ interpretation }), {
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