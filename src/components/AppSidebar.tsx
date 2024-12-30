import { LayoutDashboard, Users, CheckSquare, Menu, Phone } from "lucide-react";
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

export function AppSidebar() {
  const location = useLocation();
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

        {activeCall && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Active Call</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={`/call/${activeCall.id}`}
                        className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors bg-primary text-primary-foreground"
                      >
                        <Phone className="h-5 w-5" />
                        <div className="flex flex-col">
                          <span className="text-sm">{activeCall.client_name}</span>
                          <span className="text-xs opacity-75">{activeCall.company_name}</span>
                        </div>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}