import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Check, ListTodo, Loader2 } from "lucide-react";
import { TaskReviewItem } from "./TaskReviewItem";
import type { Task } from "@/types/task";

interface CallActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (action: "nothing" | "task") => void;
}

type DialogState = "initial" | "loading" | "review";

export function CallActionDialog({
  open,
  onOpenChange,
  onAction,
}: CallActionDialogProps) {
  const [dialogState, setDialogState] = useState<DialogState>("initial");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [approvedTasks, setApprovedTasks] = useState<Set<string>>(new Set());
  const [deniedTasks, setDeniedTasks] = useState<Set<string>>(new Set());

  const handleTaskAction = async (action: "nothing" | "task") => {
    if (action === "task") {
      setDialogState("loading");
      try {
        await onAction(action);
        setDialogState("review");
      } catch (error) {
        console.error("Error generating tasks:", error);
        setDialogState("initial");
      }
    } else {
      onAction(action);
    }
  };

  const handleTaskApproval = (task: Task) => {
    setApprovedTasks((prev) => {
      const next = new Set(prev);
      next.add(task.id);
      return next;
    });
  };

  const handleTaskDenial = (taskId: string) => {
    setDeniedTasks((prev) => {
      const next = new Set(prev);
      next.add(taskId);
      return next;
    });
  };

  const allTasksHandled = () => {
    return tasks.every(
      (task) => approvedTasks.has(task.id) || deniedTasks.has(task.id)
    );
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDialogState("initial");
      setTasks([]);
      setApprovedTasks(new Set());
      setDeniedTasks(new Set());
    }
    if (!open && dialogState === "review" && !allTasksHandled()) {
      return; // Prevent closing if not all tasks are handled
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {dialogState === "initial"
              ? "Choose Next Action"
              : dialogState === "loading"
              ? "Generating Tasks"
              : "Review Generated Tasks"}
          </DialogTitle>
          <DialogDescription>
            {dialogState === "initial"
              ? "What would you like to do with this call?"
              : dialogState === "loading"
              ? "Please wait while we analyze the call and generate tasks..."
              : "Review and approve or deny the generated tasks"}
          </DialogDescription>
        </DialogHeader>

        {dialogState === "initial" && (
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Card
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleTaskAction("nothing")}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="p-2 rounded-full bg-green-100">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium">Do Nothing</h3>
                <p className="text-sm text-gray-500">Save the call as is</p>
              </div>
            </Card>
            <Card
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleTaskAction("task")}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="p-2 rounded-full bg-blue-100">
                  <ListTodo className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium">Create Tasks</h3>
                <p className="text-sm text-gray-500">Generate tasks from call</p>
              </div>
            </Card>
          </div>
        )}

        {dialogState === "loading" && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-gray-500">
              Analyzing call and generating tasks...
            </p>
          </div>
        )}

        {dialogState === "review" && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pt-4">
            {tasks.map((task) => (
              <TaskReviewItem
                key={task.id}
                task={task}
                onApprove={handleTaskApproval}
                onDeny={handleTaskDenial}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}