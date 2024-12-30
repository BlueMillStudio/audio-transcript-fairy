import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { MainNavigation } from "./sidebar/MainNavigation";
import { RecentItems } from "./sidebar/RecentItems";

type RecentItem = {
  id: string;
  type: 'call' | 'task';
  title: string;
  subtitle?: string;
};

export function AppSidebar() {
  const location = useLocation();
  const [recentItems, setRecentItems] = useState<RecentItem[]>(() => {
    const saved = localStorage.getItem('recentItems');
    return saved ? JSON.parse(saved) : [];
  });
  
  const currentCallId = location.pathname.startsWith('/call/') 
    ? location.pathname.split('/')[2] 
    : null;

  const { data: activeCall } = useQuery({
    queryKey: ["call", currentCallId],
    queryFn: async () => {
      if (!currentCallId) return null;
      const { data } = await supabase
        .from("calls")
        .select("*")
        .eq("id", currentCallId)
        .single();
      return data;
    },
    enabled: !!currentCallId,
  });

  const { data: callTasks } = useQuery({
    queryKey: ["call-tasks", currentCallId],
    queryFn: async () => {
      if (!currentCallId) return null;
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("call_id", currentCallId);
      return data;
    },
    enabled: !!currentCallId,
  });

  useEffect(() => {
    if (activeCall) {
      const newItem: RecentItem = {
        id: activeCall.id,
        type: 'call',
        title: activeCall.client_name || 'Unnamed Call',
        subtitle: activeCall.company_name,
      };
      
      setRecentItems(current => {
        const filtered = current.filter(item => 
          !(item.type === 'call' && item.id === activeCall.id)
        );
        return [newItem, ...filtered].slice(0, 5);
      });
    }
  }, [activeCall]);

  useEffect(() => {
    if (callTasks?.length) {
      const newTasks = callTasks.map(task => ({
        id: task.id,
        type: 'task' as const,
        title: task.title,
        subtitle: task.description,
      }));
      
      setRecentItems(current => {
        const filtered = current.filter(item => 
          !(item.type === 'task' && callTasks.some(task => task.id === item.id))
        );
        return [...newTasks, ...filtered].slice(0, 5);
      });
    }
  }, [callTasks]);

  useEffect(() => {
    localStorage.setItem('recentItems', JSON.stringify(recentItems));
  }, [recentItems]);

  return (
    <Sidebar>
      <SidebarContent>
        <div className="flex items-center justify-between px-4 py-2">
          <SidebarTrigger>
            <Menu className="h-6 w-6" />
          </SidebarTrigger>
        </div>
        <MainNavigation />
        {recentItems.length > 0 && (
          <>
            <SidebarSeparator />
            <RecentItems items={recentItems} />
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}