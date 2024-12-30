import { LayoutDashboard, Users, CheckSquare, Menu, Phone, ListTodo } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const mainNavItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Clients",
    icon: Users,
    path: "/clients",
  },
  {
    title: "Tasks",
    icon: CheckSquare,
    path: "/tasks",
  },
];

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
        <SidebarGroup>
          <div className="flex items-center justify-between px-4 py-2">
            <SidebarGroupLabel className="text-lg font-bold">
              Call Transcriber
            </SidebarGroupLabel>
            <SidebarTrigger>
              <Menu className="h-6 w-6" />
            </SidebarTrigger>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent/10"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {recentItems.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="px-4 py-2">Recent Items</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {recentItems.map((item) => (
                    <SidebarMenuItem key={`${item.type}-${item.id}`}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.type === 'call' ? `/call/${item.id}` : `/tasks?id=${item.id}`}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-accent/10"
                            }`
                          }
                        >
                          {item.type === 'call' ? (
                            <Phone className="h-5 w-5" />
                          ) : (
                            <ListTodo className="h-5 w-5" />
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium">{item.title}</span>
                            {item.subtitle && (
                              <span className="text-sm opacity-75">{item.subtitle}</span>
                            )}
                          </div>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}