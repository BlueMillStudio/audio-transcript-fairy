import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Lead } from "@/types/campaign";

interface ContactsTableProps {
  contacts: Lead[];
}

export const ContactsTable = ({ contacts }: ContactsTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Contacted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell className="font-medium">{contact.name}</TableCell>
              <TableCell>{contact.company}</TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>{contact.phone_number}</TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {contact.status}
                </Badge>
              </TableCell>
              <TableCell>
                {contact.last_contacted && 
                  format(new Date(contact.last_contacted), 'MMM d, yyyy')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};