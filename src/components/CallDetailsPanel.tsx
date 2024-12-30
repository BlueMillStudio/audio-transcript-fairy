import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Phone, Building2, User, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CallDetailsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callId?: string;
}

export function CallDetailsPanel({ open, onOpenChange, callId }: CallDetailsPanelProps) {
  const { data: call } = useQuery({
    queryKey: ["call", callId],
    queryFn: async () => {
      if (!callId) return null;
      const { data } = await supabase
        .from("calls")
        .select("*")
        .eq("id", callId)
        .single();
      return data;
    },
    enabled: !!callId,
  });

  if (!call) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Call Details</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] pr-4">
          <div className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Call Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Operator</p>
                      <p className="font-medium">{call.operator_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-medium">{call.client_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Company</p>
                      <p className="font-medium">{call.company_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Call Type</p>
                      <p className="font-medium capitalize">{call.call_type}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Prospect Status</p>
                    <p className="font-medium">{call.prospect_type}</p>
                    <p className="text-sm text-muted-foreground mt-1">{call.next_action}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{call.summary}</p>
                
                {call.key_points && call.key_points.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Key Points</h3>
                    <ul className="list-disc pl-4 space-y-1">
                      {call.key_points.map((point, index) => (
                        <li key={index} className="text-sm text-muted-foreground">{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-4 w-4" />
                  Transcription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{call.transcription}</p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}