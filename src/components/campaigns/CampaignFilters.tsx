import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

interface CampaignFiltersProps {
  dateRange: string;
  filterStatus: string;
  onDateRangeChange: (value: string) => void;
  onFilterStatusChange: (value: string) => void;
}

export const CampaignFilters = ({
  dateRange,
  filterStatus,
  onDateRangeChange,
  onFilterStatusChange,
}: CampaignFiltersProps) => {
  return (
    <div className="flex items-center gap-4">
      <Select value={dateRange} onValueChange={onDateRangeChange}>
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
      <Select value={filterStatus} onValueChange={onFilterStatusChange}>
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
  );
};