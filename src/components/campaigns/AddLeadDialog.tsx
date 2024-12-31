import { useState } from "react";
import { Plus, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface AddLeadDialogProps {
  campaignId: string;
  onLeadAdded: () => void;
}

export function AddLeadDialog({ campaignId, onLeadAdded }: AddLeadDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchContacts = async (query: string) => {
    try {
      setLoading(true);
      let contactQuery = supabase
        .from('leads')
        .select('*')
        .is('campaign_id', null);

      if (query) {
        contactQuery = contactQuery.or(`name.ilike.%${query}%,company.ilike.%${query}%`);
      }

      const { data, error } = await contactQuery;
      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contacts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchContacts(query);
  };

  const handleContactSelect = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSubmit = async () => {
    if (selectedContacts.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one contact.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('leads')
        .update({ campaign_id: campaignId })
        .in('id', selectedContacts);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedContacts.length} contacts added to campaign`,
      });
      
      setOpen(false);
      onLeadAdded();
      setSelectedContacts([]);
      setSearchQuery("");
      setContacts([]);
    } catch (error) {
      console.error('Error adding contacts:', error);
      toast({
        title: "Error",
        description: "Failed to add contacts. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen);
      if (newOpen) {
        fetchContacts("");
      } else {
        setSelectedContacts([]);
        setSearchQuery("");
        setContacts([]);
      }
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Leads to Campaign</DialogTitle>
          <DialogDescription>
            Search and select contacts to add to this campaign.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          
          <ScrollArea className="h-[300px] rounded-md border p-4">
            {loading ? (
              <div className="text-center py-4">Loading contacts...</div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-4">No contacts found</div>
            ) : (
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center space-x-4 p-2 hover:bg-accent rounded-lg cursor-pointer"
                    onClick={() => handleContactSelect(contact.id)}
                  >
                    <Checkbox
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => handleContactSelect(contact.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{contact.name}</p>
                      {contact.company && (
                        <p className="text-sm text-muted-foreground">{contact.company}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-muted-foreground">
              {selectedContacts.length} contacts selected
            </p>
            <Button onClick={handleSubmit}>
              Add to Campaign
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}