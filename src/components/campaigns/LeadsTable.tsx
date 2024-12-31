import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Phone, Calendar, CheckSquare, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AudioUploader } from "@/components/AudioUploader";
import type { Lead } from "@/types/campaign";

interface LeadsTableProps {
  leads: Lead[];
  onCallNow: (leadId: string) => void;
  onScheduleFollowUp: (leadId: string) => void;
  onMarkCompleted: (leadId: string) => void;
  onUpdateStatus: (leadId: string, status: Lead['status']) => void;
}

export const LeadsTable = ({
  leads,
  onCallNow,
  onScheduleFollowUp,
  onMarkCompleted,
  onUpdateStatus,
}: LeadsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead>Last Contacted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
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
                <Badge 
                  variant="secondary" 
                  className={lead.status === 'CLOSED DEAL' 
                    ? 'bg-green-100 text-green-800' 
                    : getStatusColor(lead.status)}
                >
                  {getStatusLabel(lead.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <AudioUploader
                    onComplete={() => onCallNow(lead.id)}
                    leadId={lead.id}
                    triggerComponent={
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </Button>
                    }
                  />
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
                        onClick={() => onUpdateStatus(lead.id, 'new')}
                      >
                        Mark as New
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(lead.id, 'talking')}
                      >
                        Mark as Talking
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(lead.id, 'meeting')}
                      >
                        Mark for Meeting
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(lead.id, 'proposal')}
                      >
                        Mark as Proposal
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
  );
};
