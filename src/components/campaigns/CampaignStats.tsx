import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneCall, Users, UserCheck, Calendar, PhoneOff, Clock } from "lucide-react";

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  className?: string;
}

const StatCard = ({ icon: Icon, title, value, className = "" }: StatCardProps) => (
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

interface CampaignStatsProps {
  stats: {
    totalCalls: number;
    leadsContacted: number;
    conversions: number;
    followUps: number;
    droppedCalls: number;
    avgDuration: string;
  };
}

export const CampaignStats = ({ stats }: CampaignStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <StatCard
        icon={PhoneCall}
        title="Total Calls Made"
        value={stats.totalCalls}
      />
      <StatCard
        icon={Users}
        title="Leads Contacted"
        value={stats.leadsContacted}
      />
      <StatCard
        icon={UserCheck}
        title="Conversions"
        value={stats.conversions}
      />
      <StatCard
        icon={Calendar}
        title="Follow-Ups Scheduled"
        value={stats.followUps}
      />
      <StatCard
        icon={PhoneOff}
        title="Dropped Calls"
        value={stats.droppedCalls}
      />
      <StatCard
        icon={Clock}
        title="Call Duration (Avg)"
        value={stats.avgDuration}
      />
    </div>
  );
};