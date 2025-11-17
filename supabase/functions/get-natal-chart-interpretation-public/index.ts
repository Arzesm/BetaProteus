import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
// Optional: Assistant ID for future use with Assistants API
const OPENAI_ASSISTANT_ID = Deno.env.get("OPENAI_ASSISTANT_ID");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Публичная функция - не требует аутентификации
  console.log('🔓 Публичная функция get-natal-chart-interpretation вызвана');

  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Ключ OpenAI API не настроен на сервере.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  try {
    const { name, gender, planets, ascendant, aspects, nodes, configurations } = await req.json();
    if (!planets || !ascendant || !aspects || !name || !gender) {
      return new Response(JSON.stringify({ error: 'Необходимо указать имя, пол, положения планет, асцендент и аспекты.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const chartDescription = `
Имя: ${name}.
Пол: ${gender === 'male' ? 'Мужской' : gender === 'female' ? 'Женский' : 'Другой'}.
Асцендент: ${ascendant.sign}.
Планеты:
${planets.map((p: { name: string; sign: string; house: number; rulesHouses: number[] }) => {
    let rulership = '';
    if (p.rulesHouses && p.rulesHouses.length > 0) {
        rulership = `, управляет ${p.rulesHouses.join(' и ')} домом(ами)`;
    }
    return `${p.name} в знаке ${p.sign} в ${p.house} доме${rulership}`;
}).join('.\n')}.
Лунные узлы:
${nodes ? `Северный узел в ${nodes.north.sign}, ${nodes.north.house} дом.
Южный узел в ${nodes.south.sign}, ${nodes.south.house} дом.` : 'Н/Д'}
Конфигурации:
${configurations && configurations.length > 0 ? configurations.map((c: { name: string; participants: string[] }) => `${c.name}: ${c.participants.join(', ')}`).join('.\n') : 'Нет ярко выраженных конфигураций.'}
Ключевые аспекты:
${aspects.map((a: { planet1: string; planet2: string; aspectName: string; orb: number }) => `${a.planet1} ${a.aspectName} ${a.planet2} (орбис ${a.orb.toFixed(1)}°)`).join('.\n')}.
`;

    const systemPrompt = `🎯 Роль и миссия

Вы — прикладной консультант Proteus, искусственный интеллект, созданный Максимом Зайцевым.
Ваша задача — интерпретировать человеческие данные, внутренние паттерны и жизненные сценарии в понятной, прикладной и живой форме, как на настоящей консультации.

Вы обладаете глубиной восприятия, интуицией и логикой уровня мастера.
Вы видите не просто факты, а взаимосвязи между мотивациями, поступками, привычками и эмоциональными паттернами.
Обращаетесь исключительно на «Вы» — уважительно, с тактом, без фамильярности.

🔎 Порядок работы (обязателен)

Первое — File Search.
Сначала ищите информацию в прикреплённых файлах.
Используйте их как главный источник истины.
Никогда не придумывайте данные — пересказывайте суть и смысл найденного человеческим языком.

Интерпретация, а не цитирование.
Вы не переписываете текст из файлов, а объясняете смысл и применяете к реальной жизни человека.
Главная цель — синтезировать суть и показать, как это проявляется в личности, поступках, решениях и взаимодействии с другими.

Объём и завершённость.
Ответ должен содержать не менее 3000 слов (≈ 18 000–22 000 символов).
Если объём меньше — продолжайте, пока интерпретация не будет полной.
Каждый ответ должен быть самодостаточным, как готовая консультация.

Перед ответом выполните проверку:
✅ File Search выполнен.
✅ Данные из файлов интерпретированы простым языком.
✅ Нет терминов и астрологических жаргонов.
✅ Объём ≥ 3000 слов.
✅ Структура полностью соблюдена.

🚫 Запреты и стиль языка
Никаких астрологических терминов (знак, дом, планета, аспект, управитель, градус и т.п.).
Заменяйте их на описания качеств, сценариев, мотивов и стратегий поведения.
Без жаргона/цитат астрологов. Никаких предсказаний — только тенденции, сценарии, ресурсы, зоны роста.
Язык живой, образный, с метафорами и мини‑кейсами. Тон — уверенный, доброжелательный, уважительный.

🧱 Формат и визуализация
Жирные заголовки/подзаголовки, списки, таблицы, цитаты, лёгкие эмодзи (🌿✨💫).
Мини‑примеры: «Если Вы … — попробуйте …».

🗂️ Структура консультации Proteus (обязательно все разделы)
Если в файлах нет данных по разделу, добавьте ремарку: «В материалах по этому пункту данных нет, ниже — общие закономерности…»

🔹 0. Без вступления — сразу с сути личности.
🔹 1. Личность, характер, мотивация — драйверы, стиль решений, реакции на успех/стресс, примеры, рекомендации.
🔹 2. Таланты, навыки, мышление — тип мышления, сильные стороны, практика на 2–4 недели.
🔹 3. Деньги, карьера, самореализация — установки, 3–7 направлений с «почему», стратегия 90 дней, таблица «Сфера — Сильная сторона — Риск — Шаг».
🔹 4. Отношения, любовь, семья, сексуальность — потребности, динамика близости, 5 правил для гармонии.
🔹 5. Коммуникация и социальные роли — как Вас видят разные группы, где мягче/жёстче, 3–5 фраз‑шаблонов.
🔹 6. Интуиция, духовность, творчество, сны — каналы восприятия, практики, протокол на 14 дней.
🔹 7. Энергия, здоровье, ритм жизни — стиль восстановления, режим, энергоменеджмент (без медицины).
🔹 8. Матресурсы и время — отношение к деньгам/пространству, чек‑лист порядка, способы планирования.
🔹 9. Риски, триггеры и компенсации — «ловушки», 5–7 способов перевода минусов в плюсы, протокол 72 часа.
🔹 10. Образы и метафоры — 2–3 архетипа и короткие мантры.
🔹 11. Итог и памятка — 6–10 тезисов и рекомендации для закрепления.

🧩 Тон и стиль общения — всегда на «Вы», как живой эксперт; без воды и повторов; каждый пункт — завершённая мысль.

📐 Технические требования — минимум 3000 слов, File Search обязателен, все разделы, уважительный тон, Markdown‑формат.

⚡ Если данных не хватает — прямо пишите об этом и давайте универсальные безопасные рекомендации.`;

    let interpretation: string | null = null;
    const requestIds: string[] = [];

    let metaUsed = 'chat';
    let metaAssistantSuffix: string | null = null;
    let metaKeyPrefix: string | null = null;
    let metaKeySuffix: string | null = null;

    if (OPENAI_API_KEY) {
      metaKeyPrefix = OPENAI_API_KEY.substring(0, 6);
      metaKeySuffix = OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 6);
    }

    if (OPENAI_ASSISTANT_ID) {
      metaUsed = 'assistants';
      metaAssistantSuffix = OPENAI_ASSISTANT_ID.slice(-6);
      // Assistants API v2 flow
      const threadRes = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
        },
        body: JSON.stringify({}),
      });
      const rid1 = threadRes.headers.get('x-request-id'); if (rid1) { console.log('OpenAI x-request-id thread:', rid1); requestIds.push(rid1); }
      if (!threadRes.ok) throw new Error(`Assistants thread error: ${await threadRes.text()}`);
      const thread = await threadRes.json();

      const msgRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
        },
        body: JSON.stringify({
          role: 'user',
          content: [
            { type: 'text', text: systemPrompt },
            { type: 'text', text: `Проанализируй эту натальную карту:\n\n${chartDescription}` },
          ],
        }),
      });
      const rid2 = msgRes.headers.get('x-request-id'); if (rid2) { console.log('OpenAI x-request-id message:', rid2); requestIds.push(rid2); }
      if (!msgRes.ok) throw new Error(`Assistants message error: ${await msgRes.text()}`);

      const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
        },
        body: JSON.stringify({ assistant_id: OPENAI_ASSISTANT_ID }),
      });
      const rid3 = runRes.headers.get('x-request-id'); if (rid3) { console.log('OpenAI x-request-id run:', rid3); requestIds.push(rid3); }
      if (!runRes.ok) throw new Error(`Assistants run error: ${await runRes.text()}`);
      const run = await runRes.json();

      let status = run.status;
      let attempts = 0;
      while (['queued', 'in_progress', 'requires_action'].includes(status) && attempts < 180) {
        attempts++;
        await new Promise(r => setTimeout(r, 1000));
        const poll = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2',
          },
        });
        const data = await poll.json();
        status = data.status;
        if (status === 'requires_action' && data.required_action?.type === 'submit_tool_outputs') {
          console.log('Assistants run requires tool output, but none configured.');
          break;
        }
      }
      if (status !== 'completed') throw new Error(`Assistants run not completed after ${attempts}s: ${status}`);

      const msgsRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages?limit=1`, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2',
        },
      });
      const rid4 = msgsRes.headers.get('x-request-id'); if (rid4) { console.log('OpenAI x-request-id messages:', rid4); requestIds.push(rid4); }
      const msgs = await msgsRes.json();
      interpretation = msgs.data?.[0]?.content?.[0]?.text?.value || null;
    } else {
      // Fallback to Chat Completions
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-2024-11-20',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Проанализируй эту натальную карту:\n\n${chartDescription}` }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        }),
      });
      const rid = response.headers.get('x-request-id'); if (rid) { console.log('OpenAI x-request-id chat:', rid); requestIds.push(rid); }
      if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
      const data = await response.json();
      interpretation = data.choices[0].message.content;
    }

    const meta = { used: metaUsed, assistantIdSuffix: metaAssistantSuffix, apiKeyPrefix: metaKeyPrefix, apiKeySuffix: metaKeySuffix };
    console.log('Interpretation meta', meta);

    return new Response(JSON.stringify({ interpretation, openaiRequestIds: requestIds, meta }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Ошибка в функции:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
