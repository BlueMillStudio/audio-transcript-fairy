import { useState } from "react";
import { AudioButton } from "./audio/AudioButton";
import { AudioInput } from "./audio/AudioInput";
import { useAudioProcessing } from "./audio/useAudioProcessing";
import { ProspectDialog } from "./audio/ProspectDialog";
import { ActionDialog } from "./audio/ActionDialog";

interface AudioUploaderProps {
  onComplete?: () => void;
  triggerComponent?: React.ReactNode;
  leadId?: string;
}

export function AudioUploader({ onComplete, triggerComponent, leadId }: AudioUploaderProps) {
  const [showProspectDialog, setShowProspectDialog] = useState(false);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const {
    isUploading,
    processedCallData,
    processAudioFile,
  } = useAudioProcessing();

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

      <ProspectDialog
        open={showProspectDialog}
        onOpenChange={setShowProspectDialog}
        processedCallData={processedCallData}
        leadId={leadId}
        onComplete={onComplete}
      />

      <ActionDialog
        open={showActionDialog}
        onOpenChange={setShowActionDialog}
        processedCallData={processedCallData}
        leadId={leadId}
        onComplete={onComplete}
      />
    </>
  );
}