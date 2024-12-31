import { useState } from "react";
import { Plus, Upload } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddLeadDialogProps {
  campaignId: string;
  onLeadAdded: () => void;
}

export function AddLeadDialog({ campaignId, onLeadAdded }: AddLeadDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          campaign_id: campaignId,
          name,
          company,
          phone_number: phoneNumber,
          status: 'not_contacted'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lead added successfully",
      });
      
      setOpen(false);
      onLeadAdded();
      
      // Reset form
      setName("");
      setCompany("");
      setPhoneNumber("");
    } catch (error) {
      console.error('Error adding lead:', error);
      toast({
        title: "Error",
        description: "Failed to add lead. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileContent = await file.text();
      let leads = [];

      if (file.type === "application/json") {
        leads = JSON.parse(fileContent);
      } else if (file.type === "text/csv") {
        // Simple CSV parsing (you might want to use a library for more robust parsing)
        const rows = fileContent.split('\n');
        const headers = rows[0].split(',');
        
        leads = rows.slice(1).map(row => {
          const values = row.split(',');
          const lead = {};
          headers.forEach((header, index) => {
            lead[header.trim()] = values[index]?.trim();
          });
          return lead;
        });
      } else {
        throw new Error("Unsupported file type");
      }

      // Add campaign_id and status to each lead
      const formattedLeads = leads.map(lead => ({
        ...lead,
        campaign_id: campaignId,
        status: 'not_contacted'
      }));

      const { error } = await supabase
        .from('leads')
        .insert(formattedLeads);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${leads.length} leads imported successfully`,
      });
      
      setOpen(false);
      onLeadAdded();
    } catch (error) {
      console.error('Error importing leads:', error);
      toast({
        title: "Error",
        description: "Failed to import leads. Please check your file format and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Lead
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Add a new lead manually or import multiple leads from a file.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="flex items-center">
              <Input
                type="file"
                accept=".json,.csv"
                className="hidden"
                id="file-upload"
                onChange={handleFileUpload}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import Leads
              </Button>
            </div>
            
            <Button type="submit">Save Lead</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}