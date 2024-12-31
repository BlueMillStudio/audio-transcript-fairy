import { useState } from "react";
import { CampaignHeader } from "@/components/campaigns/CampaignHeader";
import { CampaignStats } from "@/components/campaigns/CampaignStats";
import { CampaignFilters } from "@/components/campaigns/CampaignFilters";
import { SearchBar } from "@/components/campaigns/SearchBar";
import { LeadsTable } from "@/components/campaigns/LeadsTable";

const Campaigns = () => {
  const [dateRange, setDateRange] = useState("week");
  const [filterStatus, setFilterStatus] = useState("all");

  // Placeholder data - will be replaced with real data later
  const campaignStats = {
    totalCalls: 150,
    leadsContacted: 120,
    conversions: 45,
    followUps: 30,
    droppedCalls: 5,
    avgDuration: "8m 30s",
  };

  // Placeholder leads data
  const leads = [
    {
      id: "1",
      name: "John Doe",
      company: "Tech Corp",
      phoneNumber: "+1 234 567 8900",
      lastContacted: new Date("2024-03-01"),
      status: "not_contacted" as const,
      assignedAgent: "Sarah Smith",
      notes: "Initial contact made",
    },
    {
      id: "2",
      name: "Jane Smith",
      company: "Digital Solutions",
      phoneNumber: "+1 234 567 8901",
      lastContacted: new Date("2024-03-05"),
      status: "interested" as const,
      assignedAgent: "Mike Johnson",
      notes: "Showed interest in product demo",
    },
  ];

  const handleCallNow = (leadId: string) => {
    console.log("Calling lead:", leadId);
  };

  const handleScheduleFollowUp = (leadId: string) => {
    console.log("Scheduling follow-up for lead:", leadId);
  };

  const handleMarkCompleted = (leadId: string) => {
    console.log("Marking lead as completed:", leadId);
  };

  const handleUpdateStatus = (leadId: string, status: string) => {
    console.log("Updating lead status:", leadId, status);
  };

  const handleSearch = (value: string) => {
    console.log("Searching for:", value);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <CampaignHeader
          title="Q1 Cold Outreach"
          status="active"
          campaignId="CAM001"
        />
        <CampaignFilters
          dateRange={dateRange}
          filterStatus={filterStatus}
          onDateRangeChange={setDateRange}
          onFilterStatusChange={setFilterStatus}
        />
      </div>

      <CampaignStats stats={campaignStats} />

      <SearchBar onSearch={handleSearch} />

      <LeadsTable
        leads={leads}
        onCallNow={handleCallNow}
        onScheduleFollowUp={handleScheduleFollowUp}
        onMarkCompleted={handleMarkCompleted}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default Campaigns;