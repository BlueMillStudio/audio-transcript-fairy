import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

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
    const formData = await req.formData()
    const audioFile = formData.get('file')
    
    if (!audioFile || !(audioFile instanceof File)) {
      throw new Error('No audio file provided')
    }

    console.log('Preparing to call Groq API for transcription...')

    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY is not set in environment variables')
    }

    // First, get the transcription
    const transcriptionFormData = new FormData()
    transcriptionFormData.append('file', audioFile)
    transcriptionFormData.append('model', 'whisper-large-v3-turbo')
    transcriptionFormData.append('response_format', 'json')

    console.log('Calling Groq API for transcription...')
    const transcriptionResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
      },
      body: transcriptionFormData,
    })

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text()
      console.error('Groq API transcription error:', errorText)
      throw new Error(`Groq API transcription error: ${errorText}`)
    }

    const transcriptionData = await transcriptionResponse.json()
    console.log('Successfully received transcription from Groq')

    // Now, analyze the transcription with Llama
    console.log('Preparing to analyze transcription with Llama...')
    
    const prompt = `
    Analyze this call transcription and extract the following information in JSON format:
    - operator_name: The name of the operator/agent
    - client_name: The name of the client/customer
    - company_name: The name of the company mentioned (if any)
    - call_type: Whether this is an "inbound" or "outbound" call

    Transcription: ${transcriptionData.text}

    Respond ONLY with a valid JSON object containing these fields. If you can't determine a value, use null.
    Example format:
    {
      "operator_name": "John Smith",
      "client_name": "Jane Doe",
      "company_name": "Acme Corp",
      "call_type": "inbound"
    }
    `

    const analysisResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama2-70b-4096',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that extracts information from call transcripts.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
    })

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text()
      console.error('Groq API analysis error:', errorText)
      throw new Error(`Groq API analysis error: ${errorText}`)
    }

    const analysisData = await analysisResponse.json()
    console.log('Successfully received analysis from Groq')

    // Parse the JSON response from the LLM
    const analysis = JSON.parse(analysisData.choices[0].message.content)

    // Return both transcription and analysis
    return new Response(JSON.stringify({
      text: transcriptionData.text,
      analysis
    }), {
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