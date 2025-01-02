import { format } from "date-fns";
import { AudioUploader } from "@/components/AudioUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneCall, Target, ChartBar, CheckSquare, CalendarIcon, Pill } from "lucide-react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lead } from "@/types/campaign";
import { mapDatabaseLeadToLead } from "@/types/campaign";

type CalendarEvent = Tables<"calendar_events"> & {
  calls: {
    client_name: string | null;
    company_name: string | null;
  } | null;
};

const statsData = [
  {
    title: "Active Calls",
    value: "0",
    icon: PhoneCall,
  },
  {
    title: "Total Leads",
    value: "0",
    icon: Target,
  },
  {
    title: "Proposals",
    value: "0",
    icon: ChartBar,
  },
  {
    title: "Closed Deals",
    value: "0",
    icon: CheckSquare,
  },
];

const Index = () => {
  const { data: calendarEvents, isLoading } = useQuery({
    queryKey: ["calendar-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*, calls(client_name, company_name)")
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data as CalendarEvent[];
    },
  });

  const { data: leads } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data ? data.map(mapDatabaseLeadToLead) : [];
    },
  });

  const handleUpdateStatus = async (leadId: string, status: Lead['status']) => {
    const { error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', leadId);

    if (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const upcomingEvents = calendarEvents
    ?.filter(
      (event) =>
        new Date(event.start_time) >= new Date() &&
        new Date(event.start_time).getFullYear() === new Date().getFullYear()
    )
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  return (
    <div className="w-full space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <AudioUploader />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <KanbanBoard 
        leads={leads || []} 
        onUpdateStatus={handleUpdateStatus}
      />

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            {isLoading ? (
              <p>Loading events...</p>
            ) : upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start space-x-4 rounded-lg border p-4"
                  >
                    <CalendarIcon className="h-5 w-5 text-primary mt-1" />
                    <div className="flex-1 space-y-2">
                      <div className="space-y-1">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.start_time), "MMMM d, yyyy")} at{" "}
                          {format(new Date(event.start_time), "h:mm a")}
                        </p>
                        {event.description && (
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        )}
                      </div>
                      {event.calls && (
                        <div className="flex items-center space-x-2">
                          <Pill className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-blue-500">
                            {event.calls.client_name}
                            {event.calls.company_name && (
                              <span className="text-muted-foreground">
                                {" "}
                                • {event.calls.company_name}
                              </span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No upcoming events</p>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;