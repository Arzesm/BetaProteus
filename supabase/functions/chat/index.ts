import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");

// Type definition for incoming messages
interface OpenAIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Type definition for Gemini API
interface GeminiPart {
  text: string;
}
interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (!GOOGLE_AI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Ключ Google AI API не настроен на сервере.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Необходимо передать массив сообщений.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const systemPrompt = "Ты — Протей, дружелюбный и мудрый ИИ-помощник. Ты специализируешься на психологии, астрологии, толковании снов и самопознании. Твои ответы должны быть полезными, глубокими и вдохновляющими. Отвечай на русском языке.";

    // Transform messages for Gemini API
    const geminiContents: GeminiContent[] = messages
      .filter((msg: OpenAIChatMessage) => msg.role === 'user' || msg.role === 'assistant')
      .map((msg: OpenAIChatMessage) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

    const requestBody = {
      contents: geminiContents,
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      }
    };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok || !data.candidates || data.candidates.length === 0) {
      console.error('Google AI API Error:', data);
      const errorMessage = data.error?.message || 'Ошибка при получении ответа от Google AI.';
      return new Response(JSON.stringify({ error: errorMessage }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: response.status,
      });
    }

    const assistantMessage = data.candidates[0].content.parts[0].text;
    return new Response(JSON.stringify({ reply: assistantMessage }), {
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