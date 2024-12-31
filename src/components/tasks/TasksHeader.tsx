import { Button } from "@/components/ui/button";
import { Filter, Archive } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TasksHeaderProps {
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;
  setFilters: (filters: any) => void;
  filters: any;
}

export const TasksHeader = ({
  showArchived,
  setShowArchived,
  setFilters,
  filters,
}: TasksHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
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
              Clear Filters
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
  );
};