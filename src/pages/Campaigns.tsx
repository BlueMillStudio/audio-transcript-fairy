import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  PhoneCall,
  Users,
  UserCheck,
  Calendar,
  PhoneOff,
  Clock,
  Search,
  Filter,
} from "lucide-react";

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

  const StatCard = ({ icon: Icon, title, value, className = "" }) => (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 p-8">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Q1 Cold Outreach</h1>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="success" className="bg-green-500">
              Active
            </Badge>
            <span className="text-sm text-muted-foreground">
              Campaign ID: CAM001
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not-contacted">Not Contacted</SelectItem>
              <SelectItem value="follow-up">Follow-Up</SelectItem>
              <SelectItem value="interested">Interested</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={PhoneCall}
          title="Total Calls Made"
          value={campaignStats.totalCalls}
        />
        <StatCard
          icon={Users}
          title="Leads Contacted"
          value={campaignStats.leadsContacted}
        />
        <StatCard
          icon={UserCheck}
          title="Conversions"
          value={campaignStats.conversions}
        />
        <StatCard
          icon={Calendar}
          title="Follow-Ups Scheduled"
          value={campaignStats.followUps}
        />
        <StatCard
          icon={PhoneOff}
          title="Dropped Calls"
          value={campaignStats.droppedCalls}
        />
        <StatCard
          icon={Clock}
          title="Call Duration (Avg)"
          value={campaignStats.avgDuration}
        />
      </div>

      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            className="pl-10"
          />
        </div>
        <Button>
          Add New Lead
        </Button>
      </div>

      {/* Placeholder for future sections */}
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        More sections coming soon...
      </div>
    </div>
  );
};

export default Campaigns;