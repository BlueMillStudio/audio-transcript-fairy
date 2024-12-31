import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AudioUploader } from "@/components/AudioUploader";

interface CallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadName: string;
}

export function CallDialog({ open, onOpenChange, leadName }: CallDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Call with {leadName}</DialogTitle>
          <DialogDescription>
            Upload the audio recording of your call
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <AudioUploader />
        </div>
      </DialogContent>
    </Dialog>
  );
}