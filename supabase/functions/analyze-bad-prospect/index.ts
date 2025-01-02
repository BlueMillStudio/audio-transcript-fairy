import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { transcription } = await req.json()
    
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY is not set')
    }

    console.log('Analyzing bad prospect with LLaMA...')
    const analysisResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
            content: "You are an AI that analyzes failed sales calls and provides structured feedback. Return a JSON object with the following fields: reasons (array of what went wrong), improvements (array of tips and tricks for future calls), and suggestedFollowUp (object with properties: shouldFollowUp (boolean), timeframe (string), reason (string))."
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

    if (!analysisResponse.ok) {
      throw new Error(`Groq API error: ${await analysisResponse.text()}`)
    }

    const analysisData = await analysisResponse.json()
    const analysis = JSON.parse(analysisData.choices[0].message.content)
    
    return new Response(JSON.stringify(analysis), {
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