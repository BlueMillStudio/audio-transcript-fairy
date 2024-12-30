import { Phone, ListTodo } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type RecentItem = {
  id: string;
  type: 'call' | 'task';
  title: string;
  subtitle?: string;
};

interface RecentItemsProps {
  items: RecentItem[];
}

export function RecentItems({ items }: RecentItemsProps) {
  if (!items.length) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-4 py-2">Recent Items</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={`${item.type}-${item.id}`}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.type === 'call' ? `/call/${item.id}` : `/tasks?id=${item.id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-4 py-3 rounded-md transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent/10"
                    }`
                  }
                >
                  {item.type === 'call' ? (
                    <Phone className="h-5 w-5 shrink-0" />
                  ) : (
                    <ListTodo className="h-5 w-5 shrink-0" />
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium truncate">{item.title}</span>
                    {item.subtitle && (
                      <span className="text-sm text-muted-foreground truncate">
                        {item.subtitle}
                      </span>
                    )}
                  </div>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}