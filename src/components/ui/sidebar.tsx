import * as React from "react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { PhoneCall, ListTodo, ChartBar, Target, FileText, Settings, Users, Calendar } from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation()

  const routes = [
    {
      label: "Dashboard",
      icon: PhoneCall,
      href: "/",
      active: location.pathname === "/"
    },
    {
      label: "Tasks",
      icon: ListTodo,
      href: "/tasks",
      active: location.pathname === "/tasks"
    },
    {
      label: "Campaigns",
      icon: Target,
      href: "/campaigns",
      active: location.pathname === "/campaigns"
    },
    {
      label: "Contacts",
      icon: Users,
      href: "/contacts",
      active: location.pathname === "/contacts"
    },
    {
      label: "Calendar",
      icon: Calendar,
      href: "/calendar",
      active: location.pathname === "/calendar"
    },
    {
      label: "Reports",
      icon: FileText,
      href: "/reports",
      active: location.pathname === "/reports"
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      active: location.pathname === "/settings"
    }
  ]

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold">
            Acme Inc
          </h2>
          <p className="px-4 text-sm text-muted-foreground">
            Enterprise
          </p>
        </div>
        <div className="px-3">
          <div className="space-y-1">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={route.active ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-foreground hover:text-primary-foreground",
                  route.active && "bg-muted font-medium text-foreground hover:text-primary-foreground"
                )}
                asChild
              >
                <Link to={route.href}>
                  <route.icon className="mr-2 h-4 w-4" />
                  {route.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}