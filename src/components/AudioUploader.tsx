import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

export function AudioUploader() {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [showTranscription, setShowTranscription] = useState(false);

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
      description: "Your file is being transcribed...",
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

      // Call Groq API for transcription
      const formData = new FormData();
      formData.append("file", file);
      formData.append("model", "whisper-large-v3-turbo");
      formData.append("response_format", "json");

      const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const data = await response.json();
      
      // Store transcription in Supabase
      const { error: dbError } = await supabase
        .from("calls")
        .insert({
          transcription: data.text,
          audio_url: publicUrl,
          call_type: "inbound", // Default value for now
          operator_name: "Unknown", // Default value for now
          client_name: "Unknown", // Default value for now
          company_name: "Unknown", // Default value for now
          duration: 0, // We'll need to calculate this later
        });

      if (dbError) throw dbError;

      setTranscription(data.text);
      setShowTranscription(true);
      
      toast({
        title: "Success",
        description: "Audio transcribed successfully!",
      });
    } catch (error) {
      console.error("Transcription error:", error);
      toast({
        title: "Error",
        description: "Failed to transcribe audio. Please try again.",
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

      <Dialog open={showTranscription} onOpenChange={setShowTranscription}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Transcription Result</DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[400px] overflow-y-auto">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {transcription}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}