import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioButtonProps {
  isUploading: boolean;
  onClick: () => void;
}

export function AudioButton({ isUploading, onClick }: AudioButtonProps) {
  return (
    <Button disabled={isUploading} onClick={onClick}>
      <Upload className="mr-2 h-4 w-4" />
      Upload Audio
    </Button>
  );
}