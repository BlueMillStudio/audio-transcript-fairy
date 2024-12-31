import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { FilterOptions } from "@/types/task";

export const useTasks = (filters: FilterOptions, showArchived: boolean) => {
  return useQuery({
    queryKey: ["tasks", filters, showArchived],
    queryFn: async () => {
      let query = supabase
        .from("tasks")
        .select("*, calls(client_name, company_name)")
        .eq("active_status", showArchived ? "archived" : "active")
        .order("created_at", { ascending: false });

      if (filters.priority) {
        query = query.eq("priority", filters.priority);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.assignee) {
        query = query.eq("assignee", filters.assignee);
      }
      if (filters.dueDate) {
        const now = new Date();
        switch (filters.dueDate) {
          case "overdue":
            query = query.lt("due_date", now.toISOString());
            break;
          case "today":
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            query = query
              .gte("due_date", now.toISOString())
              .lt("due_date", tomorrow.toISOString());
            break;
          case "week":
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + 7);
            query = query
              .gte("due_date", now.toISOString())
              .lt("due_date", nextWeek.toISOString());
            break;
          case "month":
            const nextMonth = new Date(now);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            query = query
              .gte("due_date", now.toISOString())
              .lt("due_date", nextMonth.toISOString());
            break;
        }
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
};