import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_KEY = "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";

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
    const formData = await req.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'Аудиофайл не найден в запросе.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const openaiFormData = new FormData();
    openaiFormData.append('file', audioFile, 'dream.webm');
    openaiFormData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: openaiFormData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI Whisper API Error:', data);
      throw new Error(data.error?.message || 'Ошибка при транскрибации аудио.');
    }

    return new Response(JSON.stringify({ transcription: data.text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Ошибка в функции транскрибации:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})