import { useState } from "react";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface TaskReviewItemProps {
  task: Task;
  onApprove: (task: Task) => void;
  onDeny: (taskId: string) => void;
}

export function TaskReviewItem({ task, onApprove, onDeny }: TaskReviewItemProps) {
  const [editedTask, setEditedTask] = useState({
    ...task,
    status: "pending" // Ensure we set a valid initial status
  });
  const [isEditing, setIsEditing] = useState(false);

  const handleApprove = () => {
    // Remove the id and ensure status is set to pending
    const { id, ...taskWithoutId } = editedTask;
    const taskToApprove = {
      ...taskWithoutId,
      status: "pending"
    } as Task;
    onApprove(taskToApprove);
  };

  return (
    <div className="p-4 border rounded-lg space-y-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      {isEditing ? (
        <div className="space-y-4">
          <Input
            value={editedTask.title}
            onChange={(e) =>
              setEditedTask({ ...editedTask, title: e.target.value })
            }
            placeholder="Task title"
          />
          <Textarea
            value={editedTask.description || ""}
            onChange={(e) =>
              setEditedTask({ ...editedTask, description: e.target.value })
            }
            placeholder="Task description"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={editedTask.priority}
              onValueChange={(value) =>
                setEditedTask({ ...editedTask, priority: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={
                editedTask.due_date
                  ? format(new Date(editedTask.due_date), "yyyy-MM-dd")
                  : ""
              }
              onChange={(e) =>
                setEditedTask({
                  ...editedTask,
                  due_date: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                })
              }
            />
          </div>
        </div>
      ) : (
        <div>
          <h3 className="font-medium">{editedTask.title}</h3>
          {editedTask.description && (
            <p className="text-sm text-gray-600 mt-1">{editedTask.description}</p>
          )}
          <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
            <span>Priority: {editedTask.priority}</span>
            {editedTask.due_date && (
              <span>
                Due: {format(new Date(editedTask.due_date), "MMM d, yyyy")}
              </span>
            )}
          </div>
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Preview" : "Edit"}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDeny(task.id)}
        >
          Deny
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={handleApprove}
          className="bg-green-500 hover:bg-green-600"
        >
          Approve
        </Button>
      </div>
    </div>
  );
}