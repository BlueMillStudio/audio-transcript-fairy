import { Card } from "@/components/ui/card";
import { Check, ListTodo } from "lucide-react";

interface InitialActionCardsProps {
  onAction: (action: "nothing" | "task") => void;
}

export function InitialActionCards({ onAction }: InitialActionCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 pt-4">
      <Card
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => onAction("nothing")}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-2 rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-medium">Do Nothing</h3>
          <p className="text-sm text-gray-500">Save the call as is</p>
        </div>
      </Card>
      <Card
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => onAction("task")}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="p-2 rounded-full bg-blue-100">
            <ListTodo className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-medium">Create Tasks</h3>
          <p className="text-sm text-gray-500">Generate tasks from call</p>
        </div>
      </Card>
    </div>
  );
}