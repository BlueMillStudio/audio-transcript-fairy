import { ScrollArea } from "@/components/ui/scroll-area";

interface CallAnalysisDisplayProps {
  analysis: {
    timeline?: string[];
    reasons?: string[];
    improvements?: string[];
  };
}

export function CallAnalysisDisplay({ analysis }: CallAnalysisDisplayProps) {
  return (
    <ScrollArea className="h-[300px] w-full pr-4">
      <div className="space-y-6">
        {analysis.timeline && (
          <div>
            <h3 className="font-semibold mb-2">Call Timeline:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {analysis.timeline.map((event, index) => (
                <li key={index} className="text-sm text-gray-600">{event}</li>
              ))}
            </ul>
          </div>
        )}

        {analysis.reasons && (
          <div>
            <h3 className="font-semibold mb-2">What Went Wrong:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {analysis.reasons.map((reason, index) => (
                <li key={index} className="text-sm text-gray-600">{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {analysis.improvements && (
          <div>
            <h3 className="font-semibold mb-2">Tips for Improvement:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {analysis.improvements.map((tip, index) => (
                <li key={index} className="text-sm text-gray-600">{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}