import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { Lead } from "@/types/campaign";

export const useLeadActions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCallNow = async (leadId: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ 
          last_contacted: new Date().toISOString()
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
        .update({ pipeline_status: 'talking' })
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
        .update({ 
          pipeline_status: 'closed',
          prospect_status: 'closed_deal'
        })
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

  const handleUpdateStatus = async (leadId: string, pipeline_status: Lead['pipeline_status']) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ pipeline_status })
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