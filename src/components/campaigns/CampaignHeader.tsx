import { Badge } from "@/components/ui/badge";

interface CampaignHeaderProps {
  title: string;
  status: 'active' | 'paused' | 'completed';
  campaignId: string;
}

export const CampaignHeader = ({ title, status, campaignId }: CampaignHeaderProps) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 text-white';
      case 'paused':
        return 'bg-yellow-500 text-white';
      case 'completed':
        return 'bg-gray-500 text-white';
      default:
        return '';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">{title}</h1>
      <div className="mt-2 flex items-center gap-2">
        <Badge className={getStatusBadgeVariant(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
        <span className="text-sm text-muted-foreground">
          Campaign ID: {campaignId}
        </span>
      </div>
    </div>
  );
};