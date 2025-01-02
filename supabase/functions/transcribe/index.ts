import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting transcription process...')
    
    // Validate request method
    if (req.method !== 'POST') {
      throw new Error(`Method ${req.method} not allowed`)
    }

    // Get and validate form data
    let formData: FormData
    try {
      formData = await req.formData()
    } catch (error) {
      console.error('Error parsing form data:', error)
      throw new Error('Invalid form data')
    }

    const audioFile = formData.get('file')
    if (!audioFile || !(audioFile instanceof File)) {
      console.error('No valid audio file provided')
      throw new Error('No audio file provided')
    }

    console.log('Audio file received:', audioFile.name, 'Size:', audioFile.size)

    // Get API key
    const groqApiKey = Deno.env.get('GROQ_API_KEY')
    if (!groqApiKey) {
      console.error('GROQ_API_KEY not found in environment')
      throw new Error('API key configuration error')
    }

    // Prepare transcription request
    console.log('Preparing transcription request...')
    const transcriptionFormData = new FormData()
    transcriptionFormData.append('file', audioFile)
    transcriptionFormData.append('model', 'whisper-large-v3-turbo')
    transcriptionFormData.append('response_format', 'json')

    // Call Groq API for transcription
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
      throw new Error(`Transcription failed: ${errorText}`)
    }

    const transcriptionData = await transcriptionResponse.json()
    console.log('Transcription successful, analyzing with LLaMA...')

    // Analyze transcription with LLaMA
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
            content: transcriptionData.text
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      }),
    })

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text()
      console.error('Groq API analysis error:', errorText)
      throw new Error(`Analysis failed: ${errorText}`)
    }

    const analysisData = await analysisResponse.json()
    const extractedInfo = JSON.parse(analysisData.choices[0].message.content)
    
    // Calculate audio duration
    const audioDuration = Math.round(audioFile.size / (16000 * 2))

    // Prepare final response
    const result = {
      text: transcriptionData.text,
      ...extractedInfo,
      duration: audioDuration
    }
    
    console.log('Processing completed successfully')
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in transcribe function:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
        details: error.stack || 'No stack trace available'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})