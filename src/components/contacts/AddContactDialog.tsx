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

interface AddContactDialogProps {
  onContactAdded: () => void;
}

export function AddContactDialog({ onContactAdded }: AddContactDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('leads')
        .insert({
          name,
          company,
          email,
          phone_number: phoneNumber,
          status: 'not_contacted'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Contact added successfully",
      });
      
      setOpen(false);
      onContactAdded();
      
      // Reset form
      setName("");
      setCompany("");
      setEmail("");
      setPhoneNumber("");
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileContent = await file.text();
      let contacts = [];

      if (file.type === "application/json") {
        contacts = JSON.parse(fileContent);
      } else if (file.type === "text/csv") {
        const rows = fileContent.split('\n');
        const headers = rows[0].split(',');
        
        contacts = rows.slice(1).map(row => {
          const values = row.split(',');
          const contact = {};
          headers.forEach((header, index) => {
            contact[header.trim()] = values[index]?.trim();
          });
          return contact;
        });
      } else {
        throw new Error("Unsupported file type");
      }

      const { error } = await supabase
        .from('leads')
        .insert(contacts.map(contact => ({
          ...contact,
          status: 'not_contacted'
        })));

      if (error) throw error;

      toast({
        title: "Success",
        description: `${contacts.length} contacts imported successfully`,
      });
      
      setOpen(false);
      onContactAdded();
    } catch (error) {
      console.error('Error importing contacts:', error);
      toast({
        title: "Error",
        description: "Failed to import contacts. Please check your file format and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add New Contact
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Add a new contact manually or import multiple contacts from a file.
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                Import Contacts
              </Button>
            </div>
            
            <Button type="submit">Save Contact</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}