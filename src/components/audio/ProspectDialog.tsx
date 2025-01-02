import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MeetingSuggestionDialog } from "../dialog/MeetingSuggestionDialog";

interface ProspectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  processedCallData: any;
  leadId?: string;
  onComplete?: () => void;
}

export function ProspectDialog({
  open,
  onOpenChange,
  processedCallData,
  leadId,
  onComplete,
}: ProspectDialogProps) {
  const { toast } = useToast();
  const [showMeetingDialog, setShowMeetingDialog] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [callId, setCallId] = useState<string>("");

  const handleProspectSelection = async (type: 'good' | 'bad' | 'none') => {
    if (type === 'bad' || type === 'good') {
      try {
        // First, save the call data
        const { data: callData, error: dbError } = await supabase
          .from('calls')
          .insert({
            ...processedCallData,
            prospect_type: type,
          })
          .select()
          .single();

        if (dbError) throw dbError;
        
        setCallId(callData.id);

        if (leadId) {
          const { error: updateError } = await supabase
            .from('leads')
            .update({ status: type === 'good' ? 'good_prospect' : 'bad_prospect' })
            .eq('id', leadId);

          if (updateError) throw updateError;
        }

        // Then, analyze the prospect based on type
        const endpoint = type === 'good' ? 'analyze-good-prospect' : 'analyze-bad-prospect';
        const { data: analysisData, error: analysisError } = await supabase.functions
          .invoke(endpoint, {
            body: { transcription: processedCallData.transcription },
          });

        if (analysisError) throw analysisError;

        setAnalysis(analysisData);
        setShowMeetingDialog(true);

        toast({
          title: "Status Updated",
          description: `Lead marked as ${type} prospect`,
        });
      } catch (error) {
        console.error("Error updating status:", error);
        toast({
          title: "Error",
          description: "Failed to update status. Please try again.",
          variant: "destructive",
        });
      }
    }
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prospect Classification</DialogTitle>
            <DialogDescription>
              How would you classify this prospect?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4">
            <Button onClick={() => handleProspectSelection('good')}>
              Good Prospect
            </Button>
            <Button onClick={() => handleProspectSelection('bad')} variant="secondary">
              Bad Prospect
            </Button>
            <Button onClick={() => handleProspectSelection('none')} variant="ghost">
              No Prospect
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {analysis && (
        <MeetingSuggestionDialog
          open={showMeetingDialog}
          onOpenChange={(open) => {
            setShowMeetingDialog(open);
            if (!open && onComplete) {
              onComplete();
            }
          }}
          analysis={analysis}
          callId={callId}
        />
      )}
    </>
  );
}