import { Button } from "@/components/ui/button";
import { Filter, Archive, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface TasksHeaderProps {
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  setFilters: (filters: any) => void;
  filters: any;
  onClearFilter: (filterType: string) => void;
}

export const TasksHeader = ({
  showArchived,
  setShowArchived,
  setFilters,
  filters,
  onClearFilter,
}: TasksHeaderProps) => {
  return (
    <div className="space-y-4 mb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {showArchived ? "Archived Tasks" : "Tasks"}
        </h1>
        <div className="flex gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFilters({ ...filters, priority: "high" })}>
                High Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilters({ ...filters, priority: "medium" })}>
                Medium Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilters({ ...filters, priority: "low" })}>
                Low Priority
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFilters({ ...filters, status: "pending" })}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilters({ ...filters, status: "in_progress" })}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilters({ ...filters, status: "completed" })}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Due Date</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFilters({ ...filters, dueDate: "overdue" })}>
                Overdue
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilters({ ...filters, dueDate: "today" })}>
                Due Today
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilters({ ...filters, dueDate: "week" })}>
                Due This Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilters({ ...filters, dueDate: "month" })}>
                Due This Month
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilters({})}>
                Clear All Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="h-4 w-4" />
            {showArchived ? "Show Active Tasks" : "Show Archived"}
          </Button>
        </div>
      </div>
      
      {/* Filter Pills */}
      {Object.keys(filters).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => (
            <Badge
              key={key}
              variant="secondary"
              className="px-3 py-1 flex items-center gap-2"
            >
              {key}: {value}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onClearFilter(key)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};