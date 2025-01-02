import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Pill } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type CalendarEvent = Tables<"calendar_events"> & {
  calls: {
    client_name: string | null;
    company_name: string | null;
  } | null;
};

const Calendar = () => {
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

  const upcomingEvents = calendarEvents
    ?.filter(
      (event) =>
        new Date(event.start_time) >= new Date() &&
        new Date(event.start_time).getFullYear() === new Date().getFullYear()
    )
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Calendar Events</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
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

export default Calendar;