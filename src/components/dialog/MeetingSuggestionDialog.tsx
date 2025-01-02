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
import { CallAnalysisDisplay } from "./CallAnalysisDisplay";
import { scheduleMeeting } from "@/utils/meetingScheduler";

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

      await scheduleMeeting(callId, startTime);

      toast({
        title: "Meeting scheduled",
        description: `Follow-up meeting scheduled for ${format(startTime, "PPp")}`,
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to schedule meeting. Please try again.",
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
          <CallAnalysisDisplay analysis={analysis} />

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