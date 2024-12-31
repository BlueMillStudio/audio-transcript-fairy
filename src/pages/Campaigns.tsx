import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CampaignHeader } from "@/components/campaigns/CampaignHeader";
import { CampaignStats } from "@/components/campaigns/CampaignStats";
import { CampaignFilters } from "@/components/campaigns/CampaignFilters";
import { SearchBar } from "@/components/campaigns/SearchBar";
import { LeadsTable } from "@/components/campaigns/LeadsTable";
import { useToast } from "@/components/ui/use-toast";
import { DatabaseCampaign, DatabaseLead } from "@/types/database";
import { mapDatabaseLeadToLead } from "@/types/campaign";

const Campaigns = () => {
  const [dateRange, setDateRange] = useState("week");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch campaign data
  const { data: campaign } = useQuery({
    queryKey: ['campaign'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', 'CAM001')
        .single();

      if (error) throw error;
      return data as DatabaseCampaign;
    },
  });

  // Fetch campaign stats
  const { data: stats } = useQuery({
    queryKey: ['campaign-stats'],
    queryFn: async () => {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('status')
        .eq('campaign_id', 'CAM001');

      if (error) throw error;

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

  // Fetch leads data
  const { data: leads, refetch: refetchLeads } = useQuery({
    queryKey: ['leads', filterStatus, dateRange, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*')
        .eq('campaign_id', 'CAM001');

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as DatabaseLead[]).map(mapDatabaseLeadToLead);
    },
  });

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
      
      refetchLeads();
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
      
      refetchLeads();
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
      
      refetchLeads();
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
      
      refetchLeads();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update lead status.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CampaignHeader
          title={campaign?.title || "Loading..."}
          status={campaign?.status || "active"}
          campaignId={campaign?.id || ""}
        />
        <CampaignFilters
          dateRange={dateRange}
          filterStatus={filterStatus}
          onDateRangeChange={setDateRange}
          onFilterStatusChange={setFilterStatus}
        />
      </div>

      <CampaignStats stats={stats || {
        totalCalls: 0,
        leadsContacted: 0,
        conversions: 0,
        followUps: 0,
        droppedCalls: 0,
        avgDuration: "0m 0s",
      }} />

      <SearchBar onSearch={handleSearch} />

      <LeadsTable
        leads={leads || []}
        onCallNow={handleCallNow}
        onScheduleFollowUp={handleScheduleFollowUp}
        onMarkCompleted={handleMarkCompleted}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default Campaigns;
