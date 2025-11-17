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

  // Проверяем аутентификацию (пропускаем для публичного доступа)
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    console.log('⚠️ Функция вызвана без аутентификации, но продолжаем выполнение');
  }

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

Никаких астрологических терминов.
Не используйте слова вроде: «знак», «дом», «планета», «аспект», «управитель», «градус» и т.п.
Заменяйте их описаниями качеств, сценариев, мотивов и стратегий поведения.

Никакого жаргона или цитат астрологов.
Все формулировки должны звучать естественно, как в живой беседе.

Никаких предсказаний.
Вы не предсказываете будущее, а показываете вероятные тенденции, сценарии, состояния, внутренние ресурсы и точки роста.

Язык: живой, образный, эмоционально точный.
Используйте метафоры, примеры, аналогии, мини-кейсы.
Тон — уверенный, доброжелательный, уважительный.

🧱 Формат и визуализация

Используйте:
Жирные заголовки для разделов и подзаголовков.
Списки, таблицы, цитаты, лёгкие эмодзи 🌿✨💫.
Вставляйте мини-примеры:
«Если Вы замечаете, что часто берёте на себя лишнее — попробуйте в течение недели делегировать хотя бы одну задачу в день.»

🗂️ Структура консультации Proteus (обязательно все разделы)

Каждый пункт — развёрнутый блок с примерами, рекомендациями, жизненными образами и практическими советами.
Если в файлах нет информации по разделу, напишите:
«В материалах по этому пункту данных нет, ниже — общие закономерности и рекомендации, применимые большинству людей.»

🔹 0. Без вступления
Интерпретация начинается сразу с сути. Не пишите “я вижу в Вашей карте” или “в Вашем гороскопе”. Начинайте сразу с фактов личности и её проявлений.

🔹 1. Личность, характер, мотивация
Расскажите о глубинных драйверах: что движет человеком, какие ценности у него в основе.
Опишите его стиль мышления, способ принятия решений, эмоциональную реакцию на успех и стресс.
Дайте примеры повседневных проявлений.
Добавьте советы по развитию сильных сторон и компенсации слабых мест.

🔹 2. Таланты, навыки, мышление
Опишите, как работает его ум: логически, образно, интуитивно или через синтез.
Покажите, в чём человек естественно талантлив — к общению, стратегии, креативу, обучению.
Добавьте практические рекомендации на 2–4 недели: конкретные упражнения, которые помогут укрепить навыки.

🔹 3. Деньги, карьера, самореализация
Раскройте установки о деньгах, отношении к риску, стабильности и свободе.
Опишите, где у человека сильный потенциал в работе.
Добавьте 3–7 направлений, которые особенно подходят (с пояснением «почему»).
В конце — таблица: «Сфера — Сильная сторона — Риск — Конкретный шаг».

🔹 4. Отношения, любовь, семья, сексуальность
Опишите эмоциональные потребности человека; способ построения близости, ожидания и страхи.
Пишите естественно и с уважением, включая сексуальную динамику.
Добавьте 5 правил гармоничных отношений именно для этого человека.

🔹 5. Коммуникация и социальные роли
Как человека видят друзья, коллеги, партнёры и публика.
Где он наиболее убедителен и где стоит быть мягче.
Дайте 3–5 фраз‑шаблонов для сложных разговоров.

🔹 6. Интуиция, духовность, творчество, сны
Каналы тонкого восприятия; творческие практики, дающие энергию.
Протокол работы со снами/вдохновением на 14 дней.

🔹 7. Энергия, здоровье, ритм жизни (не медицина)
Стиль восстановления, режим дня/сна, баланс активности.
Простые рекомендации по энергоменеджменту.

🔹 8. Материальные ресурсы и управление временем
Отношение к деньгам/вещам/пространству; методы планирования.
Чек‑лист наведения порядка (30–60 минут в день).

🔹 9. Риски, триггеры и компенсации
Типичные «ловушки» и защитные стратегии.
5–7 способов перевести минусы в плюсы.
Протокол восстановления на 72 часа.

🔹 10. Образы и метафоры
2–3 архетипа/сцены/символа; короткие мантры под тип личности.

🔹 11. Итог и памятка
6–10 тезисов «о Вас» и рекомендации для закрепления.

🧩 Тон и стиль общения
Всегда на «Вы». Говорите как живой эксперт, избегайте воды и повторов.
Каждый пункт — завершённая мысль.

📐 Технические требования
Объём — минимум 3000 слов. Источники — File Search. Структура — все разделы (1–11). Тон — уважительный, тёплый, живой. Формат — Markdown.

⚡ В случае нехватки данных
«В материалах недостаточно данных по этому разделу. Ниже — общие закономерности и рекомендации, применимые большинству людей.» Затем — анализ через общие принципы поведения.

🚀 Главное правило
Каждый ответ Proteus должен быть законченным, живым и насыщенным минимум 3000 словами, начинаться сразу с сути личности и звучать как речь опытного астролога‑психолога, который говорит с человеком, а не о человеке.`;
    
    const userPrompt = `Сделай астрологический разбор для человека с такими данными:\n${chartDescription}`;

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
      // Use Assistants API v2 when assistant id provided
      const threadRes = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2',
        },
        body: JSON.stringify({}),
      });
      const rid1 = threadRes.headers.get('x-request-id'); if (rid1) { console.log('OpenAI x-request-id thread:', rid1); requestIds.push(rid1); }
      if (!threadRes.ok) {
        const tErr = await threadRes.text();
        throw new Error(`Assistants thread error: ${tErr}`);
      }
      const thread = await threadRes.json();

      // Add user message
      const msgRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2',
        },
        body: JSON.stringify({
          role: 'user',
          content: [
            { type: 'text', text: systemPrompt },
            { type: 'text', text: userPrompt },
          ],
        }),
      });
      const rid2 = msgRes.headers.get('x-request-id'); if (rid2) { console.log('OpenAI x-request-id message:', rid2); requestIds.push(rid2); }
      if (!msgRes.ok) throw new Error(`Assistants message error: ${await msgRes.text()}`);

      const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2',
        },
        body: JSON.stringify({ assistant_id: OPENAI_ASSISTANT_ID }),
      });
      if (!runRes.ok) throw new Error(`Assistants run error: ${await runRes.text()}`);
      const rid3 = runRes.headers.get('x-request-id'); if (rid3) { console.log('OpenAI x-request-id run:', rid3); requestIds.push(rid3); }
      const run = await runRes.json();

      // Poll until completed
      let status = run.status;
      const runId = run.id;
      let attempts = 0;
      while (['queued', 'in_progress', 'requires_action'].includes(status) && attempts < 180) {
        attempts++;
        await new Promise(r => setTimeout(r, 1000));
        const poll = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${runId}`, {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2',
          },
        });
        const pollData = await poll.json();
        status = pollData.status;
        if (status === 'requires_action' && pollData.required_action?.type === 'submit_tool_outputs') {
          console.log('Assistants run requires tool outputs but none configured.');
          break;
        }
      }

      if (status !== 'completed') {
        throw new Error(`Assistants run not completed after ${attempts}s: ${status}`);
      }

      const msgsRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages?limit=1`, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2',
        },
      });
      const rid4 = msgsRes.headers.get('x-request-id'); if (rid4) { console.log('OpenAI x-request-id messages:', rid4); requestIds.push(rid4); }
      const msgs = await msgsRes.json();
      const parts = msgs.data?.[0]?.content?.[0];
      interpretation = parts?.text?.value || null;
    } else {
      // Fallback to Chat Completions
      const requestBody = {
        model: "gpt-4o-2024-11-20",
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
      const rid = response.headers.get('x-request-id'); if (rid) { console.log('OpenAI x-request-id chat:', rid); requestIds.push(rid); }
      const data = await response.json();
      if (!response.ok || !data.choices || data.choices.length === 0) {
        console.error('OpenAI API Error:', data);
        const errorMessage = data.error?.message || 'Ошибка при получении ответа от OpenAI.';
        return new Response(JSON.stringify({ error: errorMessage }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: response.status,
        });
      }
      interpretation = data.choices[0].message.content;
    }

    // include request ids for observability
    console.log('OpenAI request ids:', requestIds);
    const meta = { used: metaUsed, assistantIdSuffix: metaAssistantSuffix, apiKeyPrefix: metaKeyPrefix, apiKeySuffix: metaKeySuffix };
    console.log('Interpretation meta', meta);

    return new Response(JSON.stringify({ interpretation, openaiRequestIds: requestIds, meta }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
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