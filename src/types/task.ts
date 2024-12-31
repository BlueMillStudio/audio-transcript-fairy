export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  assignee: string | null;
  priority: string;
  call_id: string | null;
  status: string;
}