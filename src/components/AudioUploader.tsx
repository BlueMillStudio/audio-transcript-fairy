import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CallActionDialog } from "./CallActionDialog";
import type { Database } from "@/integrations/supabase/types";

export function AudioUploader() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [processedCallData, setProcessedCallData] = useState<any>(null);

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

        toast({
          title: "Tasks Generated",
          description: `${tasksData.tasks.length} tasks have been created from this call.`,
        });
      } else {
        toast({
          title: "Success",
          description: "Call processed and saved successfully!",
        });
      }
    } catch (error) {
      console.error("Error processing:", error);
      toast({
        title: "Error",
        description: "Failed to process the call. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset state
      setShowActionDialog(false);
      setProcessedCallData(null);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const validTypes = ["audio/mp3", "audio/mp4", "audio/mpeg", "audio/wav", "audio/webm"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file (MP3, MP4, WAV, or WebM)",
        variant: "destructive",
      });
      return;
    }

    // Check file size (25MB limit)
    if (file.size > 25 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an audio file smaller than 25MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    toast({
      title: "Processing audio",
      description: "Your file is being transcribed and analyzed...",
    });

    try {
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("audio")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from("audio")
        .getPublicUrl(fileName);

      // Step 1: Call Edge Function for transcription
      const formData = new FormData();
      formData.append("file", file);

      const { data: transcriptionData, error: transcriptionError } = await supabase.functions
        .invoke('transcribe', {
          body: formData,
        });

      if (transcriptionError) throw transcriptionError;

      // Step 2: Format the transcription with speaker labels
      const { data: formattedData, error: formatError } = await supabase.functions
        .invoke('format-transcript', {
          body: { transcription: transcriptionData.text },
        });

      if (formatError) throw formatError;

      // Step 3: Call Edge Function for analysis
      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('analyze-call', {
          body: { transcription: formattedData.formatted_transcript },
        });

      if (analysisError) throw analysisError;
      
      // Instead of immediately storing, prepare the data and show dialog
      setProcessedCallData({
        transcription: formattedData.formatted_transcript,
        audio_url: publicUrl,
        call_type: transcriptionData.call_type,
        operator_name: transcriptionData.operator_name,
        client_name: transcriptionData.client_name,
        company_name: transcriptionData.company_name,
        duration: transcriptionData.duration,
        summary: analysisData.summary,
        key_points: analysisData.keyPoints,
        prospect_type: analysisData.prospectType,
        next_action: analysisData.nextAction,
      } satisfies Database['public']['Tables']['calls']['Insert']);

      setShowActionDialog(true);
    } catch (error) {
      console.error("Processing error:", error);
      toast({
        title: "Error",
        description: "Failed to process audio. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <Button
          disabled={isUploading}
          onClick={() => document.getElementById("audio-input")?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Audio
        </Button>
        <input
          id="audio-input"
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      <CallActionDialog
        open={showActionDialog}
        onOpenChange={setShowActionDialog}
        onAction={handleCallAction}
      />
    </>
  );
}