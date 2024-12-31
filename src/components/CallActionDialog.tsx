import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Check, ListTodo, Loader2, Pill, XCircle } from "lucide-react";
import { TaskReviewItem } from "./TaskReviewItem";
import { Button } from "@/components/ui/button";
import type { Task } from "@/types/task";
import { cn } from "@/lib/utils";

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
  const [deniedTasks, setDeniedTasks] = useState<Task[]>([]);

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

  const handleTaskDenial = (task: Task) => {
    setDeniedTasks((prev) => [...prev, task]);
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
  };

  const handleSave = async () => {
    if (approvedTasks.length > 0) {
      await onTaskApproval(approvedTasks);
    }
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && dialogState === "review") {
      return;
    }
    if (open) {
      setDialogState("initial");
      setTasks([]);
      setApprovedTasks([]);
      setDeniedTasks([]);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
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
            <div className="flex justify-between items-start">
              <div className="w-2/3 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={cn(
                      "transform transition-all duration-300",
                      index === 0 ? "opacity-100" : "opacity-50"
                    )}
                    style={{
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
              <div className="w-1/3 space-y-4">
                {approvedTasks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-500">Approved</h4>
                    <div className="space-y-2">
                      {approvedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-2 p-2 bg-green-50 text-green-800 rounded-full animate-fade-in"
                        >
                          <Pill className="h-4 w-4" />
                          <span className="text-sm truncate">{task.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {deniedTasks.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-500">Denied</h4>
                    <div className="space-y-2">
                      {deniedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-2 p-2 bg-red-50 text-red-800 rounded-full animate-fade-in"
                        >
                          <XCircle className="h-4 w-4" />
                          <span className="text-sm truncate">{task.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {tasks.length === 0 && approvedTasks.length > 0 && (
              <div className="flex justify-end mt-4 pt-4 border-t">
                <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600">
                  Save Tasks
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}