import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Task } from "@/types/task";
import { InitialActionState } from "./dialog-states/InitialActionState";
import { LoadingState } from "./dialog-states/LoadingState";
import { ReviewState } from "./dialog-states/ReviewState";

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

  const handleSave = async () => {
    if (approvedTasks.length > 0) {
      await onTaskApproval(approvedTasks);
    }
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (dialogState === "review" && tasks.length > 0) {
        // Don't close if there are still tasks to review
        return;
      }
      setDialogState("initial");
      setTasks([]);
      setApprovedTasks([]);
      setDeniedTasks(new Set());
    }
    onOpenChange(open);
  };

  const getDialogTitle = () => {
    switch (dialogState) {
      case "initial":
        return "Choose Next Action";
      case "loading":
        return "Generating Tasks";
      case "review":
        return "Review Generated Tasks";
    }
  };

  const getDialogDescription = () => {
    switch (dialogState) {
      case "initial":
        return "What would you like to do with this call?";
      case "loading":
        return "Please wait while we analyze the call and generate tasks...";
      case "review":
        return "Review and approve or deny the generated tasks";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>

        {dialogState === "initial" && (
          <InitialActionState onAction={handleTaskAction} />
        )}

        {dialogState === "loading" && <LoadingState />}

        {dialogState === "review" && (
          <ReviewState
            tasks={tasks}
            approvedTasks={approvedTasks}
            onTaskApproval={handleTaskApproval}
            onTaskDenial={handleTaskDenial}
            onSave={handleSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}