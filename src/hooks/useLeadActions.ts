import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const useLeadActions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCallNow = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          last_contacted: new Date().toISOString(),
          status: 'contacted'
        })
        .eq('id', leadId);

      if (error) throw error;
      
      toast({
        title: "Call initiated",
        description: "Lead status has been updated.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lead status.",
        variant: "destructive",
      });
    }
  };

  const handleScheduleFollowUp = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: 'follow_up' })
        .eq('id', leadId);

      if (error) throw error;
      
      toast({
        title: "Follow-up scheduled",
        description: "Lead status has been updated.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule follow-up.",
        variant: "destructive",
      });
    }
  };

  const handleMarkCompleted = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: 'closed' })
        .eq('id', leadId);

      if (error) throw error;
      
      toast({
        title: "Lead marked as completed",
        description: "Lead status has been updated.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark lead as completed.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (leadId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', leadId);

      if (error) throw error;
      
      toast({
        title: "Status updated",
        description: "Lead status has been updated successfully.",
      });
      
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lead status.",
        variant: "destructive",
      });
    }
  };

  return {
    handleCallNow,
    handleScheduleFollowUp,
    handleMarkCompleted,
    handleUpdateStatus,
  };
};