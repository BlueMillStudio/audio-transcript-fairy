import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MeetingSuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysis: {
    timeline?: string[];
    reasons?: string[];
    improvements?: string[];
    suggestedFollowUp: {
      shouldFollowUp: boolean;
      timeframe: string;
      reason: string;
    };
  };
  callId: string;
}

export function MeetingSuggestionDialog({
  open,
  onOpenChange,
  analysis,
  callId,
}: MeetingSuggestionDialogProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>();

  const handleScheduleMeeting = async () => {
    if (!selectedDate) return;

    try {
      const startTime = new Date(selectedDate);
      startTime.setHours(10, 0, 0, 0); // Default to 10 AM
      const endTime = new Date(startTime);
      endTime.setHours(11, 0, 0, 0); // 1-hour meeting

      const { error } = await supabase
        .from('calendar_events')
        .insert({
          title: 'Follow-up Meeting',
          description: `Follow-up reason: ${analysis.suggestedFollowUp.reason}`,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          call_id: callId,
        });

      if (error) throw error;

      toast({
        title: "Meeting scheduled",
        description: `Follow-up meeting scheduled for ${format(startTime, "PPp")}`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast({
        title: "Error",
        description: "Failed to schedule meeting. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Analysis & Meeting Suggestion</DialogTitle>
          <DialogDescription>
            Review the analysis and schedule a follow-up if needed
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {analysis.timeline && (
            <div>
              <h3 className="font-semibold mb-2">Call Timeline:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {analysis.timeline.map((event, index) => (
                  <li key={index} className="text-sm text-gray-600">{event}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.reasons && (
            <div>
              <h3 className="font-semibold mb-2">What Went Wrong:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {analysis.reasons.map((reason, index) => (
                  <li key={index} className="text-sm text-gray-600">{reason}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.improvements && (
            <div>
              <h3 className="font-semibold mb-2">Tips for Improvement:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {analysis.improvements.map((tip, index) => (
                  <li key={index} className="text-sm text-gray-600">{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.suggestedFollowUp.shouldFollowUp && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Follow-up Suggestion:</h3>
                <p className="text-sm text-gray-600">
                  Recommended timeframe: {analysis.suggestedFollowUp.timeframe}
                  <br />
                  Reason: {analysis.suggestedFollowUp.reason}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Select Meeting Date:</h3>
                <div className="flex justify-center w-full">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border w-full max-w-[400px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleScheduleMeeting} disabled={!selectedDate}>
                  Schedule Meeting
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}