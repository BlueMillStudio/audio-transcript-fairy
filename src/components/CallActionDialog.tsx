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
  onAction: (action: "nothing" | "task") => Promise<Task[] | void>;
  onTaskApproval: (tasks: Task[]) => Promise<void>;
}

type DialogState = "initial" | "loading" | "review";

export function CallActionDialog({
  open,
  onOpenChange,
  onAction,
  onTaskApproval,
}: CallActionDialogProps) {
  const [dialogState, setDialogState] = useState<DialogState>("initial");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [approvedTasks, setApprovedTasks] = useState<Task[]>([]);
  const [deniedTasks, setDeniedTasks] = useState<Set<string>>(new Set());

  const handleTaskAction = async (action: "nothing" | "task") => {
    if (action === "task") {
      setDialogState("loading");
      try {
        const generatedTasks = await onAction(action);
        if (generatedTasks) {
          setTasks(generatedTasks);
          setDialogState("review");
        }
      } catch (error) {
        console.error("Error generating tasks:", error);
        setDialogState("initial");
      }
    } else {
      onAction(action);
    }
  };

  const handleTaskApproval = (task: Task) => {
    setApprovedTasks((prev) => [...prev, task]);
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
  };

  const handleTaskDenial = (taskId: string) => {
    setDeniedTasks((prev) => {
      const next = new Set(prev);
      next.add(taskId);
      return next;
    });
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (tasks.length === 0 && approvedTasks.length > 0) {
        onTaskApproval(approvedTasks);
      }
    }
    if (open) {
      setDialogState("initial");
      setTasks([]);
      setApprovedTasks([]);
      setDeniedTasks(new Set());
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
          <div className="space-y-4">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="transform transition-all duration-300 animate-fade-in"
                  style={{
                    opacity: index === 0 ? 1 : 0.5,
                    transform: `translateY(${index * 10}px)`,
                  }}
                >
                  <TaskReviewItem
                    task={task}
                    onApprove={handleTaskApproval}
                    onDeny={handleTaskDenial}
                  />
                </div>
              ))}
            </div>
            {approvedTasks.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <h4 className="font-medium text-sm text-gray-500">Approved Tasks</h4>
                {approvedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2 bg-green-50 rounded-lg animate-fade-in"
                  >
                    <p className="text-sm text-green-800">{task.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}