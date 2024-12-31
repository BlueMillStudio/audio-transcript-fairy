import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { AddLeadDialog } from "./AddLeadDialog";

interface SearchBarProps {
  onSearch: (value: string) => void;
  campaignId: string;
  onLeadAdded: () => void;
}

export const SearchBar = ({ onSearch, campaignId, onLeadAdded }: SearchBarProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search leads..."
          className="pl-10"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>
      <AddLeadDialog campaignId={campaignId} onLeadAdded={onLeadAdded} />
    </div>
  );
};