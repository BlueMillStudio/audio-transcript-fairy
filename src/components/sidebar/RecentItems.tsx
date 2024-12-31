import { Phone, X } from "lucide-react";
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
  type: 'call';
  title: string;
  subtitle?: string;
};

interface RecentItemsProps {
  items: RecentItem[];
  onRemoveItem: (id: string) => void;
}

export function RecentItems({ items, onRemoveItem }: RecentItemsProps) {
  if (!items.length) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-4 py-2">Recent Calls</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={`${item.type}-${item.id}`}>
              <div className="relative group">
                <SidebarMenuButton asChild>
                  <NavLink
                    to={`/call/${item.id}`}
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-4 py-3 rounded-md transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent/10"
                      }`
                    }
                  >
                    <Phone className="h-5 w-5 shrink-0" />
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
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemoveItem(item.id);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-accent/20 transition-opacity"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove from recent</span>
                </button>
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}