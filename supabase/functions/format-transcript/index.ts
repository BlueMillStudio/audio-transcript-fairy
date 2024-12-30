import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { transcription } = await req.json()
    
    if (!transcription) {
      throw new Error('No transcription provided')
    }

    console.log('Formatting transcription with Groq...')

    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY is not set in environment variables')
    }

    const formatResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that formats transcriptions. Add speaker labels and format the transcript in a clean way. Return the result in JSON format with these exact keys: formatted_transcript (array of objects with speaker and text keys), speakers (array of unique speaker names found in conversation)"
          },
          {
            role: "user",
            content: transcription
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      }),
    })

    if (!formatResponse.ok) {
      const errorText = await formatResponse.text()
      console.error('Groq API formatting error:', errorText)
      throw new Error(`Groq API formatting error: ${errorText}`)
    }

    const formatData = await formatResponse.json()
    const formattedResult = JSON.parse(formatData.choices[0].message.content)
    
    return new Response(JSON.stringify(formattedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})