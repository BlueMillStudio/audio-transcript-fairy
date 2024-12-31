import type { DatabaseCampaign, DatabaseLead } from './database';

export interface Campaign extends Omit<DatabaseCampaign, 'status'> {
  status: 'active' | 'paused' | 'completed';
}

export interface Lead {
  id: string;
  campaign_id: string | null;
  name: string;
  company: string | null;
  phone_number: string | null;
  email: string | null;
  status: 'not_contacted' | 'interested' | 'not_interested' | 'follow_up' | 'closed';
  last_contacted: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const mapDatabaseLeadToLead = (dbLead: DatabaseLead): Lead => ({
  id: dbLead.id,
  campaign_id: dbLead.campaign_id,
  name: dbLead.name,
  company: dbLead.company,
  phone_number: dbLead.phone_number,
  email: dbLead.email,
  status: (dbLead.status || 'not_contacted') as Lead['status'],
  last_contacted: dbLead.last_contacted,
  notes: dbLead.notes,
  created_at: dbLead.created_at,
  updated_at: dbLead.updated_at
});