import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DatabaseLead } from "@/types/database";
import { mapDatabaseLeadToLead } from "@/types/campaign";
import { useToast } from "@/components/ui/use-toast";
import { CAMPAIGN_ID } from "./useCampaignData";
import { useCampaignContext } from "@/contexts/CampaignContext";

export const useLeadsData = () => {
  const { filterStatus, dateRange, searchQuery } = useCampaignContext();
  const { toast } = useToast();

  return useQuery({
    queryKey: ['leads', filterStatus, dateRange, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*')
        .eq('campaign_id', CAMPAIGN_ID);

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        toast({
          title: "Error fetching leads",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return (data as DatabaseLead[]).map(mapDatabaseLeadToLead);
    },
  });
};