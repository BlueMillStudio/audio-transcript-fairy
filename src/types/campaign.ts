export interface Campaign {
  id: string;
  title: string;
  status: 'active' | 'paused' | 'completed';
  start_date: string;
  end_date: string | null;
  target_leads: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  campaign_id: string;
  name: string;
  company: string | null;
  phone_number: string | null;
  email: string | null;
  status: 'not_contacted' | 'contacted' | 'interested' | 'not_interested' | 'follow_up' | 'closed';
  assigned_agent: string | null;
  last_contacted: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}