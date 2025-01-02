import { useState } from "react";
import { AddContactDialog } from "@/components/contacts/AddContactDialog";
import { ContactsTable } from "@/components/contacts/ContactsTable";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { mapDatabaseLeadToLead } from "@/types/campaign";
import type { DatabaseLead } from "@/types/database";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: contacts, isLoading, refetch } = useQuery({
    queryKey: ['contacts', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*')
        .is('campaign_id', null)
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <ContactsTable contacts={contacts || []} />
    </div>
  );
};

export default Contacts;