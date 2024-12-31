import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DatabaseCampaign } from "@/types/database";
import { useToast } from "@/components/ui/use-toast";

// Using a proper UUID format
export const CAMPAIGN_ID = "123e4567-e89b-12d3-a456-426614174000";

export const useCampaignData = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['campaign'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', CAMPAIGN_ID)
        .maybeSingle();

      if (error) {
        toast({
          title: "Error fetching campaign",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      if (!data) {
        toast({
          title: "Campaign not found",
          description: "The requested campaign could not be found.",
          variant: "destructive",
        });
        return null;
      }

      return data as DatabaseCampaign;
    },
  });
};