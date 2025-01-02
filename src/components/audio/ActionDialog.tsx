import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import confetti from 'canvas-confetti';

interface ActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  processedCallData: any;
  leadId?: string;
  onComplete?: () => void;
}

export function ActionDialog({
  open,
  onOpenChange,
  processedCallData,
  leadId,
  onComplete,
}: ActionDialogProps) {
  const { toast } = useToast();

  const handleActionSelection = async (action: 'meeting' | 'proposal' | 'closed' | 'none') => {
    if (!processedCallData) return;

    try {
      const { data: callData, error: dbError } = await supabase
        .from('calls')
        .insert({
          ...processedCallData,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      if (action === 'closed') {
        if (leadId) {
          const { error: updateError } = await supabase
            .from('leads')
            .update({ status: 'closed' })
            .eq('id', leadId);

          if (updateError) throw updateError;
        }

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        toast({
          title: "Deal Closed! 🎊",
          description: "Congratulations on closing the deal!",
        });
      }

      if (action === 'proposal') {
        const { data: proposalData, error: proposalError } = await supabase.functions
          .invoke('analyze-proposal', {
            body: { transcription: processedCallData.transcription },
          });

        if (proposalError) throw proposalError;
      }

      const { data: tasksData, error: tasksError } = await supabase.functions
        .invoke('analyze-tasks', {
          body: { 
            transcription: processedCallData.transcription,
            call_id: callData.id
          },
        });

      if (tasksError) throw tasksError;

      toast({
        title: "Success",
        description: "Call processed successfully!",
      });

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Error processing:", error);
      toast({
        title: "Error",
        description: "Failed to process the call. Please try again.",
        variant: "destructive",
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Next Action</DialogTitle>
          <DialogDescription>
            What's the next step with this prospect?
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => handleActionSelection('meeting')}>
            Schedule Meeting
          </Button>
          <Button onClick={() => handleActionSelection('proposal')} variant="secondary">
            Create Proposal
          </Button>
          <Button onClick={() => handleActionSelection('closed')} variant="secondary">
            Mark as Closed
          </Button>
          <Button onClick={() => handleActionSelection('none')} variant="ghost">
            No Action
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}