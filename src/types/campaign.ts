import type { DatabaseCampaign, DatabaseLead } from './database';

export interface Campaign extends Omit<DatabaseCampaign, 'status'> {
  status: 'active' | 'paused' | 'completed';
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  phoneNumber: string;
  lastContacted: Date | null;
  status: 'not_contacted' | 'interested' | 'not_interested' | 'follow_up' | 'closed';
  assignedAgent: string;
  notes: string;
}

export const mapDatabaseLeadToLead = (dbLead: DatabaseLead): Lead => ({
  id: dbLead.id,
  name: dbLead.name,
  company: dbLead.company || '',
  phoneNumber: dbLead.phone_number || '',
  lastContacted: dbLead.last_contacted ? new Date(dbLead.last_contacted) : null,
  status: (dbLead.status || 'not_contacted') as Lead['status'],
  assignedAgent: dbLead.assigned_agent || '',
  notes: dbLead.notes || '',
});