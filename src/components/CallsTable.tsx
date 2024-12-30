import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

type Call = {
  id: string;
  operator_name: string;
  client_name: string;
  company_name: string;
  duration: number;
  call_type: string;
};

export function CallsTable() {
  const [calls, setCalls] = useState<Call[]>([]);

  const { data: initialCalls } = useQuery({
    queryKey: ['calls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calls')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Call[];
    },
  });

  useEffect(() => {
    if (initialCalls) {
      setCalls(initialCalls);
    }
  }, [initialCalls]);

  useEffect(() => {
    const channel = supabase
      .channel('calls-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calls'
        },
        async (payload) => {
          console.log('Real-time update received:', payload);
          
          // Fetch the latest data
          const { data, error } = await supabase
            .from('calls')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (!error && data) {
            setCalls(data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call) => (
            <TableRow key={call.id}>
              <TableCell>{call.operator_name}</TableCell>
              <TableCell>{call.client_name}</TableCell>
              <TableCell>{call.company_name}</TableCell>
              <TableCell>{formatDuration(call.duration)}</TableCell>
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