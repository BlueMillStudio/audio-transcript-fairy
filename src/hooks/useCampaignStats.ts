import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { CAMPAIGN_ID } from "./useCampaignData";

export const useCampaignStats = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['campaign-stats'],
    queryFn: async () => {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('status')
        .eq('campaign_id', CAMPAIGN_ID);

      if (error) {
        toast({
          title: "Error fetching stats",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      const totalCalls = leads?.length || 0;
      const leadsContacted = leads?.filter(l => l.status !== 'not_contacted').length || 0;
      const conversions = leads?.filter(l => l.status === 'interested').length || 0;
      const followUps = leads?.filter(l => l.status === 'follow_up').length || 0;

      return {
        totalCalls,
        leadsContacted,
        conversions,
        followUps,
        droppedCalls: 0,
        avgDuration: "0m 0s",
      };
    },
  });
};