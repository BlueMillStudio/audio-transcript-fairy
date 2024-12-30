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
    const formData = await req.formData()
    const audioFile = formData.get('file')
    
    if (!audioFile || !(audioFile instanceof File)) {
      throw new Error('No audio file provided')
    }

    console.log('Preparing to call Groq API for transcription...')

    // First, get the transcription
    const transcriptionFormData = new FormData()
    transcriptionFormData.append('file', audioFile)
    transcriptionFormData.append('model', 'whisper-large-v3-turbo')
    transcriptionFormData.append('response_format', 'json')

    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY is not set in environment variables')
    }

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
    const transcription = transcriptionData.text

    console.log('Successfully received transcription, now analyzing with LLaMA...')

    // Now, analyze the transcription with LLaMA
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
            content: "You are a helpful assistant that extracts information from call transcripts. Extract the operator name, client name, company name, and determine if it's an inbound or outbound call. Return the information in JSON format with these exact keys: operator_name, client_name, company_name, call_type (which should be either 'inbound' or 'outbound')"
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
      const errorText = await analysisResponse.text()
      console.error('Groq API analysis error:', errorText)
      throw new Error(`Groq API analysis error: ${errorText}`)
    }

    const analysisData = await analysisResponse.json()
    const extractedInfo = JSON.parse(analysisData.choices[0].message.content)
    
    // Calculate audio duration in seconds
    const audioDuration = Math.round(audioFile.size / (16000 * 2)) // Approximate duration based on file size

    // Combine all the information
    const result = {
      text: transcription,
      ...extractedInfo,
      duration: audioDuration
    }
    
    return new Response(JSON.stringify(result), {
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