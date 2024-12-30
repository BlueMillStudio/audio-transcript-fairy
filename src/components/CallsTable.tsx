import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Call = Database['public']['Tables']['calls']['Row'];

export function CallsTable() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch initial data
    const fetchCalls = async () => {
      const { data } = await supabase
        .from('calls')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setCalls(data);
    };

    fetchCalls();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('calls-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'calls'
        },
        (payload) => {
          setCalls(current => [payload.new as Call, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleRow = (id: string) => {
    setExpandedRows(current => ({
      ...current,
      [id]: !current[id]
    }));
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Operator</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Prospect</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call) => (
            <TableRow key={call.id}>
              <TableCell>{call.operator_name}</TableCell>
              <TableCell>{call.client_name}</TableCell>
              <TableCell>{call.company_name}</TableCell>
              <TableCell>{call.duration}s</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    call.call_type === "inbound"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {call.call_type}
                </span>
              </TableCell>
              <TableCell>
                <Collapsible>
                  <CollapsibleTrigger
                    onClick={() => toggleRow(call.id)}
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        call.prospect_type === "Good Prospect"
                          ? "bg-green-100 text-green-700"
                          : call.prospect_type === "Bad Prospect"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {call.prospect_type}
                    </span>
                    {expandedRows[call.id] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 p-4">
                    <div>
                      <h4 className="font-semibold">Summary</h4>
                      <p className="text-sm text-gray-600">{call.summary}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Next Action</h4>
                      <p className="text-sm text-gray-600">{call.next_action}</p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/call/${call.id}`)}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}