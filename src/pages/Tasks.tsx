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
      const { error } = await supabase
        .from("tasks")
        .update({ active_status: "archived" })
        .eq("id", taskId);

      if (error) throw error;

      toast({
        title: "Task archived",
        description: "The task has been archived successfully.",
      });
      
      refetch();
    } catch (error) {
      console.error("Error archiving task:", error);
      toast({
        title: "Error",
        description: "Failed to archive task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClearFilter = (filterType: string) => {
    const newFilters = { ...filters };
    delete newFilters[filterType];
    setFilters(newFilters);
  };

  return (
    <div className="p-8">
      <TasksHeader
        showArchived={showArchived}
        setShowArchived={setShowArchived}
        filters={filters}
        setFilters={setFilters}
        onClearFilter={handleClearFilter}
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