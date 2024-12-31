import { Pill, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskReviewItem } from "../TaskReviewItem";
import type { Task } from "@/types/task";
import { cn } from "@/lib/utils";

interface TaskReviewSectionProps {
  tasks: Task[];
  approvedTasks: Task[];
  deniedTasks: Task[];
  onTaskApproval: (task: Task) => void;
  onTaskDenial: (task: Task) => void;
  onSave: () => void;
}

export function TaskReviewSection({
  tasks,
  approvedTasks,
  deniedTasks,
  onTaskApproval,
  onTaskDenial,
  onSave,
}: TaskReviewSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="w-2/3 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
          <div className="relative">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className={cn(
                  "transform transition-all duration-300 absolute w-full",
                  index === 0 
                    ? "top-0 opacity-100 scale-100 z-20" 
                    : `top-${Math.min((index) * 16, 48)} opacity-50 scale-95 z-10`
                )}
                style={{
                  transform: `translateY(${index * 4}rem)`,
                }}
              >
                <TaskReviewItem
                  task={task}
                  onApprove={onTaskApproval}
                  onDeny={onTaskDenial}
                  isActive={index === 0}
                />
              </div>
            ))}
          </div>
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
          <Button onClick={onSave} className="bg-green-500 hover:bg-green-600">
            Save Tasks
          </Button>
        </div>
      )}
    </div>
  );
}