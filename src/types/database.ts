export type CampaignStatus = 'active' | 'paused' | 'completed';

export interface DatabaseCampaign {
  id: string;
  title: string;
  status: string;
  start_date: string;
  end_date: string | null;
  target_leads: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseLead {
  id: string;
  campaign_id: string | null;
  name: string;
  company: string | null;
  phone_number: string | null;
  email: string | null;
  status: string;
  assigned_agent: string | null;
  last_contacted: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}