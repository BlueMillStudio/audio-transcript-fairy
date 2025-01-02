import { supabase } from "@/integrations/supabase/client";

export async function scheduleMeeting(callId: string, startTime: Date) {
  try {
    // Get call details
    const { data: callData, error: callError } = await supabase
      .from('calls')
      .select('client_name, company_name')
      .eq('id', callId)
      .maybeSingle();

    if (callError) throw callError;
    if (!callData) {
      throw new Error("Could not find the call details.");
    }

    console.log('Call data found:', callData);

    // Find the lead based on the call data
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select('id, campaign_id')
      .eq('name', callData.client_name)
      .eq('company', callData.company_name)
      .maybeSingle();

    console.log('Lead query result:', leadData);

    if (leadError) throw leadError;
    if (!leadData) {
      throw new Error("Could not find the associated lead. Please make sure the lead exists in the system.");
    }

    // Create calendar event
    const endTime = new Date(startTime);
    endTime.setHours(startTime.getHours() + 1);

    const { error: calendarError } = await supabase
      .from('calendar_events')
      .insert({
        title: `Meeting with ${callData.client_name}`,
        description: `Follow-up meeting with ${callData.client_name} from ${callData.company_name}`,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        call_id: callId,
      });

    if (calendarError) throw calendarError;

    // Update lead status
    const { error: updateError } = await supabase
      .from('leads')
      .update({ 
        status: 'meeting',
        last_contacted: new Date().toISOString()
      })
      .eq('id', leadData.id);

    if (updateError) throw updateError;

    console.log('Meeting scheduled successfully');
    return { success: true };
  } catch (error) {
    console.error('Error in scheduleMeeting:', error);
    throw error;
  }
}