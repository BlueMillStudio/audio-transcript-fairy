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
import { ExternalLink, ChevronDown, ChevronUp, Phone, Calendar, CheckSquare, MoreVertical } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { AddLeadDialog } from "./AddLeadDialog";
import { CallDialog } from "./CallDialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Lead = Database['public']['Tables']['leads']['Row'];

interface LeadsTableProps {
  leads: Lead[];
  onCallNow: (leadId: string) => void;
  onScheduleFollowUp: (leadId: string) => void;
  onMarkCompleted: (leadId: string) => void;
  onUpdateStatus: (leadId: string, status: string) => void;
}

export const LeadsTable = ({
  leads,
  onCallNow,
  onScheduleFollowUp,
  onMarkCompleted,
  onUpdateStatus,
}: LeadsTableProps) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showAddLeadDialog, setShowAddLeadDialog] = useState(false);

  const handleCallClick = (lead: Lead) => {
    setSelectedLead(lead);
    setShowCallDialog(true);
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'interested':
        return 'bg-green-100 text-green-800';
      case 'not_interested':
        return 'bg-red-100 text-red-800';
      case 'follow_up':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusLabel = (status: Lead['status']) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Last Contacted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[160px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>{lead.company}</TableCell>
                <TableCell>{lead.phone_number}</TableCell>
                <TableCell>
                  {lead.last_contacted
                    ? format(new Date(lead.last_contacted), 'MMM d, yyyy')
                    : 'Never'}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(lead.status)}>
                    {getStatusLabel(lead.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCallClick(lead)}
                      className="flex items-center gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onScheduleFollowUp(lead.id)}
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Schedule
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkCompleted(lead.id)}
                      className="flex items-center gap-2"
                    >
                      <CheckSquare className="h-4 w-4" />
                      Complete
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(lead.id, 'not_contacted')}
                        >
                          Mark as Not Contacted
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(lead.id, 'interested')}
                        >
                          Mark as Interested
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(lead.id, 'not_interested')}
                        >
                          Mark as Not Interested
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(lead.id, 'follow_up')}
                        >
                          Mark for Follow-up
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(lead.id, 'closed')}
                        >
                          Mark as Closed
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedLead && (
        <CallDialog
          open={showCallDialog}
          onOpenChange={setShowCallDialog}
          leadName={selectedLead.name}
        />
      )}
      <AddLeadDialog
        open={showAddLeadDialog}
        onOpenChange={setShowAddLeadDialog}
      />
    </>
  );
};