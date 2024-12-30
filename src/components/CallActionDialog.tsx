import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Check, ListTodo } from "lucide-react";

interface CallActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (action: "nothing" | "task") => void;
}

export function CallActionDialog({
  open,
  onOpenChange,
  onAction,
}: CallActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose Next Action</DialogTitle>
          <DialogDescription>
            What would you like to do with this call?
          </DialogDescription>
        </DialogHeader>
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
              <h3 className="font-medium">Create Task</h3>
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}