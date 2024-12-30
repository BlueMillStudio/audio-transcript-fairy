import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export function AudioUploader() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

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

      // Step 2: Call Edge Function for analysis
      const { data: analysisData, error: analysisError } = await supabase.functions
        .invoke('analyze-call', {
          body: { transcription: transcriptionData.text },
        });

      if (analysisError) throw analysisError;
      
      // Store all data in Supabase
      const { error: dbError } = await supabase
        .from('calls')
        .insert({
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

      if (dbError) throw dbError;
      
      toast({
        title: "Success",
        description: "Audio processed and analyzed successfully!",
      });
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
  );
}