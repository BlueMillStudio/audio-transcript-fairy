import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { Task } from "@/types/task";
import { InitialActionCards } from "./dialog/InitialActionCards";
import { TaskReviewSection } from "./dialog/TaskReviewSection";

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
          <InitialActionCards onAction={handleTaskAction} />
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
          <TaskReviewSection
            tasks={tasks}
            approvedTasks={approvedTasks}
            deniedTasks={deniedTasks}
            onTaskApproval={handleTaskApproval}
            onTaskDenial={handleTaskDenial}
            onSave={handleSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}