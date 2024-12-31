import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import type { Lead } from "@/types/campaign";
import { mapDatabaseLeadToLead } from "@/types/campaign";

const COLUMNS = [
  { id: 'new', title: 'New', color: 'bg-gray-100' },
  { id: 'talking', title: 'Talking', color: 'bg-blue-100' },
  { id: 'meeting', title: 'Meeting', color: 'bg-purple-100' },
  { id: 'proposal', title: 'Proposal', color: 'bg-yellow-100' },
  { id: 'closed', title: 'Closed', color: 'bg-green-100' },
];

export function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      return;
    }

    setLeads(data ? data.map(mapDatabaseLeadToLead) : []);
  };

  const getLeadsByStatus = (status: Lead['status']) => {
    return leads.filter(lead => lead.status === status);
  };

  return (
    <div className="grid grid-cols-5 gap-4 h-[calc(100vh-12rem)] overflow-hidden">
      {COLUMNS.map(column => (
        <div key={column.id} className="flex flex-col h-full">
          <Card className="h-full">
            <CardHeader className={`${column.color} rounded-t-lg`}>
              <CardTitle className="text-sm font-medium">
                {column.title}
                <Badge variant="secondary" className="ml-2">
                  {getLeadsByStatus(column.id as Lead['status']).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto h-full">
              <div className="space-y-2">
                {getLeadsByStatus(column.id as Lead['status']).map(lead => (
                  <Card key={lead.id} className="p-3">
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {lead.company}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}