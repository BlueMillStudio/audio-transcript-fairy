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
import { ExternalLink, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";

type Task = Database['public']['Tables']['tasks']['Row'];

const Tasks = () => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>();
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
  const [selectedCallId, setSelectedCallId] = useState<string>();
  const [isCallPanelOpen, setIsCallPanelOpen] = useState(false);

  const { data: tasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tasks")
        .select("*, calls(client_name, company_name)")
        .order("created_at", { ascending: false });
      return data as (Task & { calls: { client_name: string | null, company_name: string | null } | null })[];
    },
  });

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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tasks</h1>
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