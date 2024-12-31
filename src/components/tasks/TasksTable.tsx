import { format } from "date-fns";
import { Archive, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPriorityColor, getStatusColor } from "@/lib/utils";
import type { Task } from "@/types/task";

interface TasksTableProps {
  tasks: Task[];
  onViewTask: (taskId: string) => void;
  onArchiveTask?: (taskId: string) => void;
  showArchived?: boolean;
}

export const TasksTable = ({
  tasks,
  onViewTask,
  onArchiveTask,
  showArchived = false,
}: TasksTableProps) => {
  return (
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
                      <div className="text-sm text-muted-foreground">
                        {task.calls.company_name}
                      </div>
                    </div>
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
                    onClick={() => onViewTask(task.id)}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View
                  </Button>
                  {!showArchived && onArchiveTask && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onArchiveTask(task.id)}
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
  );
};