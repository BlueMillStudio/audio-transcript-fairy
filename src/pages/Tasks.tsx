import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaskPanel } from "@/components/TaskPanel";
import { CallDetailsPanel } from "@/components/CallDetailsPanel";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ExternalLink, Phone, Archive, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Task = Database['public']['Tables']['tasks']['Row'];

type FilterOptions = {
  priority?: string;
  status?: string;
  assignee?: string;
  dueDate?: 'overdue' | 'today' | 'week' | 'month' | null;
};

const Tasks = () => {
  const { toast } = useToast();
  const [selectedTaskId, setSelectedTaskId] = useState<string>();
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
  const [selectedCallId, setSelectedCallId] = useState<string>();
  const [isCallPanelOpen, setIsCallPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showArchived, setShowArchived] = useState(false);

  const { data: tasks, refetch } = useQuery({
    queryKey: ["tasks", filters, showArchived],
    queryFn: async () => {
      let query = supabase
        .from(showArchived ? "archived_tasks" : "tasks")
        .select("*, calls(client_name, company_name)")
        .order("created_at", { ascending: false });

      if (filters.priority) {
        query = query.eq("priority", filters.priority);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.assignee) {
        query = query.eq("assignee", filters.assignee);
      }
      if (filters.dueDate) {
        const now = new Date();
        switch (filters.dueDate) {
          case "overdue":
            query = query.lt("due_date", now.toISOString());
            break;
          case "today":
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            query = query
              .gte("due_date", now.toISOString())
              .lt("due_date", tomorrow.toISOString());
            break;
          case "week":
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + 7);
            query = query
              .gte("due_date", now.toISOString())
              .lt("due_date", nextWeek.toISOString());
            break;
          case "month":
            const nextMonth = new Date(now);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            query = query
              .gte("due_date", now.toISOString())
              .lt("due_date", nextMonth.toISOString());
            break;
        }
      }

      const { data } = await query;
      return data as (Task & { calls: { client_name: string | null, company_name: string | null } | null })[];
    },
  });

  const handleArchiveTask = async (taskId: string) => {
    const { data: task } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .single();

    if (task) {
      const { error: archiveError } = await supabase
        .from("archived_tasks")
        .insert({
          ...task,
          original_task_id: task.id,
          archived_at: new Date().toISOString(),
        });

      if (!archiveError) {
        const { error: deleteError } = await supabase
          .from("tasks")
          .delete()
          .eq("id", taskId);

        if (!deleteError) {
          toast({
            title: "Task archived",
            description: "The task has been moved to the archive.",
          });
          refetch();
        }
      }
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Related Call</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks?.map((task) => (
              <TableRow key={task.id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>
                  {task.calls && (
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="font-medium">{task.calls.client_name}</div>
                        <div className="text-sm text-muted-foreground">{task.calls.company_name}</div>
                      </div>
                      {task.call_id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedCallId(task.call_id);
                            setIsCallPanelOpen(true);
                          }}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {task.due_date && format(new Date(task.due_date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(task.status)}>
                    {task.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setIsTaskPanelOpen(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View
                    </Button>
                    {!showArchived && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchiveTask(task.id)}
                        className="flex items-center gap-2"
                      >
                        <Archive className="h-4 w-4" />
                        Archive
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <TaskPanel
        open={isTaskPanelOpen}
        onOpenChange={setIsTaskPanelOpen}
        taskId={selectedTaskId}
      />
      <CallDetailsPanel
        open={isCallPanelOpen}
        onOpenChange={setIsCallPanelOpen}
        callId={selectedCallId}
      />
    </div>
  );
};

export default Tasks;