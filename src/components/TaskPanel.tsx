import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { TaskReviewItem } from "./TaskReviewItem";

type Task = Database['public']['Tables']['tasks']['Row'];

interface TaskPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callId?: string;
  taskId?: string;
}

export function TaskPanel({ open, onOpenChange, callId, taskId }: TaskPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      let query = supabase.from('tasks').select('*');
      
      if (callId) {
        query = query.eq('call_id', callId);
      } else if (taskId) {
        query = query.eq('id', taskId);
      }
      
      const { data } = await query.order('created_at', { ascending: false });
      if (data) setTasks(data);
    };

    if (open) {
      fetchTasks();
    }

    // Subscribe to real-time updates
    const channel = supabase
      .channel('tasks-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks(current => [payload.new as Task, ...current]);
          } else if (payload.eventType === 'UPDATE') {
            setTasks(current =>
              current.map(task =>
                task.id === payload.new.id ? payload.new as Task : task
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setTasks(current =>
              current.filter(task => task.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [open, callId, taskId]);

  const handleApprove = async (task: Task) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'approved' })
      .eq('id', task.id);

    if (error) {
      console.error('Error approving task:', error);
    }
  };

  const handleDeny = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'denied' })
      .eq('id', taskId);

    if (error) {
      console.error('Error denying task:', error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Tasks</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] pr-4">
          <div className="space-y-4 mt-4">
            {tasks.map((task) => (
              <TaskReviewItem
                key={task.id}
                task={task}
                onApprove={handleApprove}
                onDeny={handleDeny}
              />
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}