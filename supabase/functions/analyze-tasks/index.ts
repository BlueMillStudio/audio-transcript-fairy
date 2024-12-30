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

    console.log('Analyzing call with LLaMA to generate tasks...')
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
            content: "You are an AI that analyzes call transcriptions and breaks them down into actionable tasks. Return a JSON object with an array of tasks, where each task has: title (string), description (string), dueDate (string in ISO format, estimate based on urgency), assignee (string, extract from context or leave empty), and priority (high/medium/low based on context)."
          },
          {
            role: "user",
            content: transcription
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      }),
    });

    if (!analysisResponse.ok) {
      throw new Error(`Groq API error: ${await analysisResponse.text()}`)
    }

    const analysisData = await analysisResponse.json()
    const tasks = JSON.parse(analysisData.choices[0].message.content)
    
    return new Response(JSON.stringify(tasks), {
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