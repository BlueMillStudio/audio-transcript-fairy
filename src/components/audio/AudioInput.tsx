import { useToast } from "@/hooks/use-toast";

interface AudioInputProps {
  onFileChange: (file: File) => void;
}

export function AudioInput({ onFileChange }: AudioInputProps) {
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    onFileChange(file);
  };

  return (
    <input
      id="audio-input"
      type="file"
      accept="audio/*"
      className="hidden"
      onChange={handleFileChange}
    />
  );
}