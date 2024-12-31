import { Sidebar, SidebarContent, SidebarSeparator } from "@/components/ui/sidebar";
import { MainNavigation } from "./sidebar/MainNavigation";
import { RecentItems } from "./sidebar/RecentItems";
import { useState } from "react";

export function AppSidebar() {
  const [recentItems, setRecentItems] = useState([
    { id: "1", name: "Item 1" },
    { id: "2", name: "Item 2" },
    { id: "3", name: "Item 3" },
  ]);

  const handleRemoveItem = (itemId: string) => {
    setRecentItems((items) => items.filter((item) => item.id !== itemId));
  };

  return (
    <Sidebar>
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
