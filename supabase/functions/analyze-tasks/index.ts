import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcription, call_id } = await req.json();
    
    if (!transcription || !call_id) {
      throw new Error('Transcription and call_id are required');
    }

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY is not set');
    }

    console.log('Analyzing transcription for call_id:', call_id);

    // Call LLaMA to analyze the transcription and generate tasks
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
            content: `You are a task extraction assistant. Analyze the call transcription and create a list of actionable tasks. 
            For each task, provide:
            - A clear, concise title
            - A detailed description
            - Priority level (high/medium/low)
            - A reasonable due date (as an ISO string, within the next 2 weeks)
            Format the response as a JSON array of tasks.`
          },
          {
            role: "user",
            content: transcription
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!analysisResponse.ok) {
      throw new Error(`Groq API error: ${await analysisResponse.text()}`);
    }

    const analysisData = await analysisResponse.json();
    const tasks = JSON.parse(analysisData.choices[0].message.content).tasks;

    console.log('Generated tasks:', tasks);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials are not set');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prepare tasks for insertion - explicitly omit any id field
    const tasksToInsert = tasks.map((task: any) => ({
      title: task.title,
      description: task.description,
      priority: task.priority.toLowerCase(),
      due_date: task.due_date,
      call_id: call_id,
      status: 'pending',
      active_status: 'active'
    }));

    console.log('Inserting tasks:', tasksToInsert);

    // Insert tasks into the database
    const { data: insertedTasks, error: insertError } = await supabase
      .from('tasks')
      .insert(tasksToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting tasks:', insertError);
      throw insertError;
    }

    console.log('Successfully inserted tasks:', insertedTasks);

    return new Response(JSON.stringify({ tasks: insertedTasks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-tasks function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});