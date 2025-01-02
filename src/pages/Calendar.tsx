import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Circle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { ScrollArea } from "@/components/ui/scroll-area";

type CalendarEvent = Tables<"calendar_events">;

export default function CalendarPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const { data: calendarEvents, isLoading } = useQuery({
    queryKey: ["calendar-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("calendar_events")
        .select("*")
        .order("start_time", { ascending: true });

      if (error) throw error;
      return data as CalendarEvent[];
    },
  });

  useEffect(() => {
    if (calendarEvents) {
      setEvents(calendarEvents);
    }
  }, [calendarEvents]);

  const selectedDateEvents = events.filter(
    (event) =>
      format(new Date(event.start_time), "yyyy-MM-dd") ===
      format(date, "yyyy-MM-dd")
  );

  const upcomingEvents = events
    .filter(
      (event) =>
        new Date(event.start_time) >= new Date() &&
        new Date(event.start_time).getFullYear() === new Date().getFullYear()
    )
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // Function to check if a date has events
  const hasEventOnDay = (day: Date) => {
    return events.some(
      (event) =>
        format(new Date(event.start_time), "yyyy-MM-dd") ===
        format(day, "yyyy-MM-dd")
    );
  };

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Calendar</h2>
          <p className="text-muted-foreground">
            Manage your meetings and follow-ups
          </p>
        </div>
      </div>
      <div className="flex flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0">
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className="rounded-md border w-full"
                modifiers={{
                  hasEvent: (date) => hasEventOnDay(date),
                }}
                modifiersStyles={{
                  hasEvent: {
                    textDecoration: "underline",
                  },
                }}
                components={{
                  DayContent: ({ date }) => (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {date.getDate()}
                      {hasEventOnDay(date) && (
                        <Circle className="h-1.5 w-1.5 absolute bottom-0 text-red-500" fill="currentColor" />
                      )}
                    </div>
                  ),
                }}
              />
            </CardContent>
          </Card>
        </div>
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Events for {format(date, "MMMM d, yyyy")}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading events...</p>
              ) : selectedDateEvents.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center space-x-4 rounded-lg border p-4"
                    >
                      <CalendarIcon className="h-5 w-5 text-primary" />
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.start_time), "h:mm a")} -{" "}
                          {format(new Date(event.end_time), "h:mm a")}
                        </p>
                        {event.description && (
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No events for this day</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming Events Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center space-x-4 rounded-lg border p-4"
                  >
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <div className="flex-1 space-y-1">
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
}