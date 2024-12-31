import { useState } from "react";
import { AudioButton } from "./audio/AudioButton";
import { AudioInput } from "./audio/AudioInput";
import { useAudioProcessing } from "./audio/useAudioProcessing";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import confetti from 'canvas-confetti';
import type { Task } from "@/types/task";

interface AudioUploaderProps {
  onComplete?: () => void;
  triggerComponent?: React.ReactNode;
  leadId?: string;
}

type ProspectType = 'good' | 'bad' | 'none';
type ActionType = 'meeting' | 'proposal' | 'closed' | 'none';

export function AudioUploader({ onComplete, triggerComponent, leadId }: AudioUploaderProps) {
  const { toast } = useToast();
  const [showProspectDialog, setShowProspectDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [prospectType, setProspectType] = useState<ProspectType>('none');
  const {
    isUploading,
    processedCallData,
    processAudioFile,
  } = useAudioProcessing();

  const handleProspectSelection = async (type: ProspectType) => {
    setProspectType(type);
    
    if (type === 'bad') {
      try {
        const { error: dbError } = await supabase
          .from('calls')
          .insert({
            ...processedCallData,
            prospect_type: 'bad',
          });

        if (dbError) throw dbError;

        if (leadId) {
          const { error: updateError } = await supabase
            .from('leads')
            .update({ status: 'bad_prospect' })
            .eq('id', leadId);

          if (updateError) throw updateError;
        }

        toast({
          title: "Status Updated",
          description: "Lead marked as bad prospect",
        });

        if (onComplete) {
          onComplete();
        }
      } catch (error) {
        console.error("Error updating status:", error);
        toast({
          title: "Error",
          description: "Failed to update status. Please try again.",
          variant: "destructive",
        });
      }
      setShowProspectDialog(false);
    } else {
      setShowProspectDialog(false);
      setShowActionDialog(true);
    }
  };

  const handleActionSelection = async (action: ActionType) => {
    if (!processedCallData) return;

    try {
      const { data: callData, error: dbError } = await supabase
        .from('calls')
        .insert({
          ...processedCallData,
          prospect_type: prospectType,
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
        
        setShowActionDialog(false);
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
    } finally {
      setShowActionDialog(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    await processAudioFile(file);
    setShowProspectDialog(true);
  };

  return (
    <>
      <div className="flex items-center gap-4">
        {triggerComponent ? (
          <div onClick={() => document.getElementById("audio-input")?.click()}>
            {triggerComponent}
          </div>
        ) : (
          <AudioButton
            isUploading={isUploading}
            onClick={() => document.getElementById("audio-input")?.click()}
          />
        )}
        <AudioInput onFileChange={handleFileUpload} />
      </div>

      <Dialog open={showProspectDialog} onOpenChange={setShowProspectDialog}>
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

      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
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
    </>
  );
}
