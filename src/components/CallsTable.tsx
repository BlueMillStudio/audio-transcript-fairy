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
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Call = Database['public']['Tables']['calls']['Row'];

export function CallsTable() {
  const [calls, setCalls] = useState<Call[]>([]);
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call) => (
            <TableRow 
              key={call.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => navigate(`/call/${call.id}`)}
            >
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}