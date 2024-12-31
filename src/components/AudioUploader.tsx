import { AudioButton } from "./audio/AudioButton";
import { AudioInput } from "./audio/AudioInput";
import { useAudioProcessing } from "./audio/useAudioProcessing";
import { CallActionDialog } from "./CallActionDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Task } from "@/types/task";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface AudioUploaderProps {
  onProcessingComplete?: () => void;
}

export function AudioUploader({ onProcessingComplete }: AudioUploaderProps) {
  const { toast } = useToast();
  const {
    isUploading,
    showActionDialog,
    setShowActionDialog,
    processedCallData,
    processAudioFile,
    showUploadDialog,
    setShowUploadDialog
  } = useAudioProcessing();

  const handleCallAction = async (action: "nothing" | "task") => {
    if (!processedCallData) return;

    try {
      // First save the call data
      const { data: callData, error: dbError } = await supabase
        .from('calls')
        .insert(processedCallData)
        .select()
        .single();

      if (dbError) throw dbError;

      if (action === "task") {
        // Generate tasks from the transcription
        const { data: tasksData, error: tasksError } = await supabase.functions
          .invoke('analyze-tasks', {
            body: { 
              transcription: processedCallData.transcription,
              call_id: callData.id
            },
          });

        if (tasksError) throw tasksError;
        
        onProcessingComplete?.();
        return tasksData.tasks;
      } else {
        toast({
          title: "Success",
          description: "Call processed and saved successfully!",
        });
        setShowActionDialog(false);
        onProcessingComplete?.();
      }
    } catch (error) {
      console.error("Error processing:", error);
      toast({
        title: "Error",
        description: "Failed to process the call. Please try again.",
        variant: "destructive",
      });
      setShowActionDialog(false);
    }
  };

  const handleTaskApproval = async (approvedTasks: Task[]) => {
    try {
      const { error: insertError } = await supabase
        .from('tasks')
        .insert(approvedTasks);

      if (insertError) throw insertError;

      toast({
        title: "Tasks Created",
        description: `${approvedTasks.length} tasks have been created from this call.`,
      });
    } catch (error) {
      console.error("Error saving tasks:", error);
      toast({
        title: "Error",
        description: "Failed to save tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setShowActionDialog(false);
      onProcessingComplete?.();
    }
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <AudioButton
          isUploading={isUploading}
          onClick={() => setShowUploadDialog(true)}
        />
        <AudioInput onFileChange={processAudioFile} />
      </div>
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Audio</DialogTitle>
          </DialogHeader>
          <AudioInput onFileChange={(file) => {
            processAudioFile(file);
            setShowUploadDialog(false);
          }} />
        </DialogContent>
      </Dialog>
      <CallActionDialog
        open={showActionDialog}
        onOpenChange={setShowActionDialog}
        onAction={handleCallAction}
        onTaskApproval={handleTaskApproval}
      />
    </>
  );
}