import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    const systemPrompt = `Ты — Протей, мудрый и добрый астролог. Твоя задача — написать короткий (2-3 абзаца) и вдохновляющий прогноз на день для человека, основываясь на текущих транзитах к его натальной карте.

**Правила:**
1.  **Обращайся на "вы"**: "Сегодня вам стоит...", "Ваша энергия будет направлена на...".
2.  **Никакого жаргона**: Не используй слова "транзит", "аспект", "натальный", "Солнце", "Марс", "квадрат", "трин" и т.д.
3.  **Переводи на язык психологии и событий**: Вместо "Транзитный Марс в квадрате к натальному Сатурну" напиши "Сегодня вы можете столкнуться с препятствиями в достижении целей, которые потребуют терпения и дисциплины. Возможны конфликты с авторитетами или ощущение ограничений."
4.  **Структура**:
    - **Общая атмосфера дня**: Какое настроение будет преобладать?
    - **Ключевые темы**: На какие сферы жизни (работа, отношения, саморазвитие) стоит обратить внимание?
    - **Практический совет**: Дай один конкретный, полезный совет на день.
5.  **Будь позитивным, но реалистичным**: Укажи на возможности, а вызовы представь как точки роста.

Вот данные для анализа:`;
    
    const userPrompt = `
Краткая сводка натальной карты:
${chartSummary}

Ключевые транзиты на сегодня:
${transitsSummary}

Напиши прогноз на день для этого человека.`;

    const requestBody = {
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
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

    const interpretation = data.choices[0].message.content;
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