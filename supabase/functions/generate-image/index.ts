import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    const missingVars = [
      !OPENAI_API_KEY && "OPENAI_API_KEY",
      !SUPABASE_URL && "SUPABASE_URL",
      !SUPABASE_SERVICE_ROLE_KEY && "SUPABASE_SERVICE_ROLE_KEY"
    ].filter(Boolean).join(", ");
    
    return new Response(JSON.stringify({ error: `Следующие переменные окружения не настроены: ${missingVars}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }

  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Необходимо указать prompt.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 1. Generate image with OpenAI
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `Create a highly realistic, photorealistic image representing the following dream scene. The image should be clear, sharp, and expressive with detailed textures and lighting. IMPORTANT: Do NOT include any text, words, letters, or writing in the image. Focus on visual storytelling through realistic imagery only.

Dream description: ${prompt}

Style requirements:
- Photorealistic, detailed rendering
- Clear and sharp focus
- Expressive and emotionally engaging
- Rich colors and proper lighting
- No text or letters anywhere in the image`,
        n: 1,
        size: "1024x1024",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API Error:', data);
      throw new Error(data.error?.message || 'Ошибка при генерации изображения в OpenAI.');
    }

    // Get the image URL from OpenAI response
    const imageUrl = data.data[0].url;

    // 2. Download the image from OpenAI
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Ошибка при загрузке изображения из OpenAI.');
    }
    
    const imageBlob = await imageResponse.blob();
    const imageBuffer = new Uint8Array(await imageBlob.arrayBuffer());

    // 3. Upload image to Supabase Storage
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const fileName = `${crypto.randomUUID()}.png`;
    const bucketName = 'dream_images';

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '31536000',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase Storage Error:', uploadError);
      throw new Error(uploadError.message || 'Ошибка при загрузке изображения в хранилище.');
    }

    // 4. Get public URL for the uploaded image
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    const finalImageUrl = publicUrlData.publicUrl;

    return new Response(JSON.stringify({ image: finalImageUrl }), {
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