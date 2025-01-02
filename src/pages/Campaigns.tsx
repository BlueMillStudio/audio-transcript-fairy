import { CampaignHeader } from "@/components/campaigns/CampaignHeader";
import { CampaignStats } from "@/components/campaigns/CampaignStats";
import { CampaignFilters } from "@/components/campaigns/CampaignFilters";
import { SearchBar } from "@/components/campaigns/SearchBar";
import { LeadsTable } from "@/components/campaigns/LeadsTable";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CampaignProvider, useCampaignContext } from "@/contexts/CampaignContext";
import { useCampaignData } from "@/hooks/useCampaignData";
import { useCampaignStats } from "@/hooks/useCampaignStats";
import { useLeadsData } from "@/hooks/useLeadsData";
import { useLeadActions } from "@/hooks/useLeadActions";
import { Skeleton } from "@/components/ui/skeleton";
import { CAMPAIGN_ID } from "@/hooks/useCampaignData";

const CampaignContent = () => {
  const { 
    dateRange, 
    filterStatus, 
    setDateRange, 
    setFilterStatus,
    setSearchQuery 
  } = useCampaignContext();

  const { data: campaign, isLoading: campaignLoading, error: campaignError } = useCampaignData();
  const { data: stats, isLoading: statsLoading, error: statsError } = useCampaignStats();
  const { data: leads, isLoading: leadsLoading, error: leadsError, refetch: refetchLeads } = useLeadsData();
  const { 
    handleCallNow, 
    handleScheduleFollowUp, 
    handleMarkCompleted, 
    handleUpdateStatus 
  } = useLeadActions();

  if (campaignLoading || statsLoading || leadsLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  if (campaignError || statsError || leadsError) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Campaign</h2>
        <p className="text-gray-600">Please try refreshing the page.</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Campaign Not Found</h2>
        <p className="text-gray-600">The requested campaign could not be found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CampaignHeader
          title={campaign.title}
          status={campaign.status}
          campaignId={campaign.id}
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

      <SearchBar 
        onSearch={setSearchQuery} 
        campaignId={CAMPAIGN_ID} 
        onLeadAdded={refetchLeads} 
      />

      <Tabs defaultValue="table" className="w-full">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table">
          <LeadsTable
            leads={leads || []}
            onCallNow={handleCallNow}
            onScheduleFollowUp={handleScheduleFollowUp}
            onMarkCompleted={handleMarkCompleted}
            onUpdateStatus={handleUpdateStatus}
          />
        </TabsContent>
        
        <TabsContent value="kanban">
          <KanbanBoard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Campaigns = () => {
  return (
    <CampaignProvider>
      <div className="container mx-auto py-8 px-4">
        <CampaignContent />
      </div>
    </CampaignProvider>
  );
};

export default Campaigns;