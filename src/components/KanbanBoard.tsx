import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Lead } from "@/types/campaign";

const COLUMNS = [
  { id: 'new', title: 'New', color: 'bg-gray-100' },
  { id: 'talking', title: 'Talking', color: 'bg-blue-100' },
  { id: 'meeting', title: 'Meeting', color: 'bg-purple-100' },
  { id: 'proposal', title: 'Proposal', color: 'bg-yellow-100' },
  { id: 'closed', title: 'Closed', color: 'bg-green-100' },
];

interface KanbanBoardProps {
  leads: Lead[];
  onUpdateStatus?: (leadId: string, status: Lead['status']) => void;
}

export function KanbanBoard({ leads, onUpdateStatus }: KanbanBoardProps) {
  const getLeadsByStatus = (status: string) => {
    return leads.filter(lead => lead.status === status);
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (onUpdateStatus) {
      onUpdateStatus(leadId, status as Lead['status']);
    }
  };

  return (
    <div className="grid grid-cols-5 gap-4 h-[500px]">
      {COLUMNS.map(column => (
        <div 
          key={column.id} 
          className="flex flex-col h-full"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <Card className="h-full flex flex-col">
            <CardHeader className={`${column.color} rounded-t-lg flex-shrink-0`}>
              <CardTitle className="text-sm font-medium">
                {column.title}
                <Badge variant="secondary" className="ml-2">
                  {getLeadsByStatus(column.id).length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-3">
              <ScrollArea className="h-[400px] w-full pr-4">
                <div className="space-y-2">
                  {getLeadsByStatus(column.id).map(lead => (
                    <Card 
                      key={lead.id} 
                      className="p-3 cursor-move hover:shadow-md transition-shadow"
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                    >
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {lead.company}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}