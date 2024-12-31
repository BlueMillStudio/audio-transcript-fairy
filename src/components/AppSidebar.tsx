import { Sidebar, SidebarContent, SidebarSeparator } from "@/components/ui/sidebar";
import { MainNavigation } from "./sidebar/MainNavigation";
import { RecentItems } from "./sidebar/RecentItems";
import { useState } from "react";

type RecentItem = {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
};

export function AppSidebar() {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([
    { id: "1", type: "call", title: "Item 1" },
    { id: "2", type: "call", title: "Item 2" },
    { id: "3", type: "call", title: "Item 3" },
  ]);

  const handleRemoveItem = (itemId: string) => {
    setRecentItems((items) => items.filter((item) => item.id !== itemId));
  };

  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <MainNavigation />
        {recentItems.length > 0 && (
          <>
            <SidebarSeparator />
            <RecentItems items={recentItems} onRemoveItem={handleRemoveItem} />
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}