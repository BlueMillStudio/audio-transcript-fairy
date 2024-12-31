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

interface Lead {
  id: string;
  name: string;
  company: string;
  phoneNumber: string;
  lastContacted: Date | null;
  status: 'not_contacted' | 'interested' | 'not_interested' | 'follow_up' | 'closed';
  assignedAgent: string;
  notes: string;
}

interface LeadsTableProps {
  leads: Lead[];
  onCallNow: (leadId: string) => void;
  onScheduleFollowUp: (leadId: string) => void;
  onMarkCompleted: (leadId: string) => void;
  onUpdateStatus: (leadId: string, status: Lead['status']) => void;
}

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
            <TableHead>Assigned Agent</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell>{lead.company}</TableCell>
              <TableCell>{lead.phoneNumber}</TableCell>
              <TableCell>
                {lead.lastContacted
                  ? format(new Date(lead.lastContacted), 'MMM d, yyyy')
                  : 'Never'}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className={getStatusColor(lead.status)}>
                  {getStatusLabel(lead.status)}
                </Badge>
              </TableCell>
              <TableCell>{lead.assignedAgent}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCallNow(lead.id)}
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
  );
};