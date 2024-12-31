import { useState } from "react";
import { Plus, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Papa from 'papaparse';

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  onLeadsAdded: () => void;
}

export function AddLeadDialog({
  open,
  onOpenChange,
  campaignId,
  onLeadsAdded,
}: AddLeadDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSave = async () => {
    if (!name) {
      toast({
        title: "Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("leads").insert({
        campaign_id: campaignId,
        name,
        company,
        phone_number: phoneNumber,
        status: "not_contacted",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Lead added successfully",
      });

      setName("");
      setCompany("");
      setPhoneNumber("");
      onLeadsAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding lead:", error);
      toast({
        title: "Error",
        description: "Failed to add lead",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (file.type === "application/json") {
        const text = await file.text();
        const leads = JSON.parse(text);
        await processLeads(leads);
      } else if (file.type === "text/csv") {
        Papa.parse(file, {
          complete: async (results) => {
            const leads = results.data.slice(1).map((row: any) => ({
              name: row[0],
              company: row[1],
              phone_number: row[2],
            }));
            await processLeads(leads);
          },
          header: false,
        });
      } else {
        throw new Error("Invalid file type");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error",
        description: "Failed to process file",
        variant: "destructive",
      });
    }
  };

  const processLeads = async (leads: any[]) => {
    try {
      const { error } = await supabase.from("leads").insert(
        leads.map((lead) => ({
          campaign_id: campaignId,
          name: lead.name,
          company: lead.company,
          phone_number: lead.phone_number,
          status: "not_contacted",
        }))
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: `${leads.length} leads added successfully`,
      });

      onLeadsAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding leads:", error);
      toast({
        title: "Error",
        description: "Failed to add leads",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Enter lead details or upload a file with multiple leads
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter lead name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Enter company name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          <div className="flex justify-between items-center">
            <Button onClick={handleSave}>
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}