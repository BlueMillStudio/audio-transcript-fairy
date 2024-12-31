import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TaskPanel } from "@/components/TaskPanel";
import { CallDetailsPanel } from "@/components/CallDetailsPanel";
import { TasksHeader } from "@/components/tasks/TasksHeader";
import { TasksTable } from "@/components/tasks/TasksTable";
import { useTasks } from "@/hooks/useTasks";
import { supabase } from "@/integrations/supabase/client";
import type { FilterOptions } from "@/types/task";

const Tasks = () => {
  const { toast } = useToast();
  const [selectedTaskId, setSelectedTaskId] = useState<string>();
  const [isTaskPanelOpen, setIsTaskPanelOpen] = useState(false);
  const [selectedCallId, setSelectedCallId] = useState<string>();
  const [isCallPanelOpen, setIsCallPanelOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showArchived, setShowArchived] = useState(false);

  const { data: tasks, refetch } = useTasks(filters, showArchived);

  const handleArchiveTask = async (taskId: string) => {
    try {
      // First, get the task data
      const { data: task } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", taskId)
        .single();

      if (task) {
        // Insert into archived_tasks with a new UUID
        const { error: archiveError } = await supabase
          .from("archived_tasks")
          .insert({
            ...task,
            id: undefined, // Let Supabase generate a new UUID
            original_task_id: task.id,
            archived_at: new Date().toISOString(),
          });

        if (archiveError) throw archiveError;

        // Update the original task's status to archived
        const { error: updateError } = await supabase
          .from("tasks")
          .update({ status: "archived" })
          .eq("id", taskId);

        if (updateError) throw updateError;

        toast({
          title: "Task archived",
          description: "The task has been moved to the archive.",
        });
        
        refetch();
      }
    } catch (error) {
      console.error("Error archiving task:", error);
      toast({
        title: "Error",
        description: "Failed to archive task. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8">
      <TasksHeader
        showArchived={showArchived}
        setShowArchived={setShowArchived}
        filters={filters}
        setFilters={setFilters}
      />
      <TasksTable
        tasks={tasks || []}
        onViewTask={(taskId) => {
          setSelectedTaskId(taskId);
          setIsTaskPanelOpen(true);
        }}
        onArchiveTask={!showArchived ? handleArchiveTask : undefined}
        showArchived={showArchived}
      />
      <TaskPanel
        open={isTaskPanelOpen}
        onOpenChange={setIsTaskPanelOpen}
        taskId={selectedTaskId}
      />
      <CallDetailsPanel
        open={isCallPanelOpen}
        onOpenChange={setIsCallPanelOpen}
        callId={selectedCallId}
      />
    </div>
  );
};

export default Tasks;