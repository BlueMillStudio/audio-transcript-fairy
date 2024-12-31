export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  assignee: string | null;
  priority: string;
  call_id: string | null;
  status: string;
  calls?: {
    client_name: string | null;
    company_name: string | null;
  } | null;
}

export type FilterOptions = {
  priority?: string;
  status?: string;
  assignee?: string;
  dueDate?: 'overdue' | 'today' | 'week' | 'month' | null;
};