import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Task } from "@/types/task";

interface TaskReviewItemProps {
  task: Task;
  onApprove: () => void;
  onDeny: () => void;
}

export function TaskReviewItem({ task, onApprove, onDeny }: TaskReviewItemProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await onApprove();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeny = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await onDeny();
    } finally {
      setIsProcessing(false);
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
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold">{task.title}</h3>
        <div className="flex gap-2">
          <Badge variant="secondary" className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
          <Badge variant="secondary" className={getStatusColor(task.status)}>
            {task.status}
          </Badge>
        </div>
      </div>
      {task.description && (
        <p className="mt-2 text-sm text-muted-foreground">
          {task.description}
        </p>
      )}
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>Assigned to: {task.assignee || 'Unassigned'}</span>
        {task.due_date && (
          <span>
            Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
          </span>
        )}
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={handleDeny}
          disabled={isProcessing}
          className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Deny
        </button>
        <button
          onClick={handleApprove}
          disabled={isProcessing}
          className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Approve
        </button>
      </div>
    </div>
  );
}