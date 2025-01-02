import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DatabaseCampaign } from "@/types/database";
import { useToast } from "@/components/ui/use-toast";

// Using the ID of one of the campaigns we just inserted
export const CAMPAIGN_ID = "123e4567-e89b-12d3-a456-426614174000";

export const useCampaignData = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['campaign'],
    queryFn: async () => {
      const { data: campaigns, error } = await supabase
        .from('campaigns')
        .select('*')
        .limit(1);

      if (error) {
        toast({
          title: "Error fetching campaign",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      if (!campaigns || campaigns.length === 0) {
        toast({
          title: "No campaigns found",
          description: "Please make sure campaigns exist in the database.",
          variant: "destructive",
        });
        return null;
      }

      return campaigns[0] as DatabaseCampaign;
    },
  });
};