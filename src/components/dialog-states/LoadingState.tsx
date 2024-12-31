import { Loader2 } from "lucide-react";

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-gray-500">
        Analyzing call and generating tasks...
      </p>
    </div>
  );
}