import { useState } from "react";
import { AddContactDialog } from "@/components/contacts/AddContactDialog";
import { ContactsTable } from "@/components/contacts/ContactsTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { mapDatabaseLeadToLead } from "@/types/campaign";
import type { DatabaseLead } from "@/types/database";

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: contacts, isLoading, refetch } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const query = supabase
        .from('leads')
        .select('*')
        .is('campaign_id', null)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query.or(`name.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Map the database leads to the Lead type
      return (data as DatabaseLead[]).map(mapDatabaseLeadToLead);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <AddContactDialog onContactAdded={() => refetch()} />
      </div>
      <ContactsTable contacts={contacts || []} />
    </div>
  );
};

export default Contacts;