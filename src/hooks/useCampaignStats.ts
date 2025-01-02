import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useCampaignStats = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['campaign-stats'],
    queryFn: async () => {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('status, last_contacted');

      if (error) {
        toast({
          title: "Error fetching stats",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      const totalCalls = leads?.filter(l => l.last_contacted !== null).length || 0;
      const leadsContacted = leads?.filter(l => l.last_contacted !== null).length || 0;
      const conversions = leads?.filter(l => l.status === 'closed').length || 0;
      const followUps = leads?.filter(l => l.status === 'meeting').length || 0;
      const droppedCalls = leads?.filter(l => l.status === 'new').length || 0;

      // Calculate average duration (mock data for now)
      const avgDuration = "2m 30s";

      return {
        totalCalls,
        leadsContacted,
        conversions,
        followUps,
        droppedCalls,
        avgDuration,
      };
    },
  });
};