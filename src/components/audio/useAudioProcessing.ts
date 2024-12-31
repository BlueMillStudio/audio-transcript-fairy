import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export function useAudioProcessing() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [processedCallData, setProcessedCallData] = useState<any>(null);

  const processAudioFile = async (file: File) => {
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

      // Step 2: Call Edge Function for analysis
      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('analyze-call', {
          body: { transcription: transcriptionData.text },
        });

      if (analysisError) throw analysisError;
      
      setProcessedCallData({
        transcription: transcriptionData.text,
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

  return {
    isUploading,
    showActionDialog,
    setShowActionDialog,
    showUploadDialog,
    setShowUploadDialog,
    processedCallData,
    processAudioFile,
  };
}