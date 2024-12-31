import { Button } from "@/components/ui/button";
import { TaskReviewItem } from "../TaskReviewItem";
import type { Task } from "@/types/task";

interface ReviewStateProps {
  tasks: Task[];
  approvedTasks: Task[];
  onTaskApproval: (task: Task) => void;
  onTaskDenial: (taskId: string) => void;
  onSave: () => void;
}

export function ReviewState({
  tasks,
  approvedTasks,
  onTaskApproval,
  onTaskDenial,
  onSave,
}: ReviewStateProps) {
  return (
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
              onApprove={onTaskApproval}
              onDeny={onTaskDenial}
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