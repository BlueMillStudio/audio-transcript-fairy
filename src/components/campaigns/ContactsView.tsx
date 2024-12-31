import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Contact {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone_number: string | null;
  last_contacted: string | null;
}

export function ContactsView({ campaignId }: { campaignId: string }) {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('name');
      
      if (error) {
        console.error('Error fetching contacts:', error);
        return;
      }
      
      setContacts(data);
    };

    fetchContacts();
  }, [campaignId]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Last Contacted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell className="font-medium">{contact.name}</TableCell>
              <TableCell>{contact.company || '-'}</TableCell>
              <TableCell>{contact.email || '-'}</TableCell>
              <TableCell>{contact.phone_number || '-'}</TableCell>
              <TableCell>
                {contact.last_contacted ? (
                  format(new Date(contact.last_contacted), 'MMM d, yyyy')
                ) : (
                  <Badge variant="secondary">Never contacted</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}