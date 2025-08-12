import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || "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";
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') || "gpt-5";



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
    const { dreamText, dreamDate } = await req.json();
    if (!dreamText) {
      return new Response(JSON.stringify({ error: 'Необходимо указать текст сна.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const systemPrompt = `Ты — психолог-толкователь снов. Твоя задача — давать глубокие, но лаконичные интерпретации.

ФОРМАТ ОТВЕТА: один сплошной абзац с использованием **жирного шрифта** для ключевых слов и важных образов.

ОБЯЗАТЕЛЬНО:
- Объем: 150–200 слов (не более 200 слов)
- Подробно, но емко: без воды, только существенные смыслы
- Выделяй **жирным** ключевые слова, важные образы и психологические термины
- Объясняй значение образов и символов и связывай их с реальной жизнью и эмоциональным состоянием
- Пиши простыми словами и давай практические выводы и инсайты

ПРИМЕР СТИЛЯ (фрагмент): «Этот сон отражает ваше **внутреннее стремление к свободе**. **Полет** символизирует желание подняться над рутиной, а **город внизу** — повседневные ограничения. Вы обладаете **внутренними ресурсами** и готовы к переменам…»`;
    
    const userPrompt = `Растолкуй этот сон глубоко и емко. Формат: один сплошной абзац, 150–200 слов (не более 200). Используй **жирный шрифт** для выделения ключевых слов и важных моментов. Текст сна: ${dreamText}`;

    const requestBody = {
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 230,
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

    // Server-side guardrail: ensure 150–200 words without client-side trimming
    const countWords = (s: string) => (s || '').trim().split(/\s+/).filter(Boolean).length;
    const wc = countWords(interpretation);
    if (wc < 150 || wc > 200) {
      const strictSystem = `${systemPrompt}\n\nВНИМАНИЕ: Дай ответ объёмом 150–200 слов. Никогда не превышай 200 слов. Остановись сразу при достижении 200 слов.`;
      const retryBody = {
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: strictSystem },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 230,
      };
      const retry = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify(retryBody),
      });
      const retryData = await retry.json();
      if (retry.ok && retryData.choices && retryData.choices.length > 0) {
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