import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare, Phone, Building2, User, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const CallDetails = () => {
  const { id } = useParams();

  const { data: call, isLoading } = useQuery({
    queryKey: ["call", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("calls")
        .select("*")
        .eq("id", id)
        .single();
      return data;
    },
  });

  const { data: tasks } = useQuery({
    queryKey: ["call-tasks", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("call_id", id)
        .order('created_at', { ascending: false });
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <div>Loading...</div>;
  if (!call) return null;

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Call Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Operator</p>
                    <p className="font-medium">{call.operator_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Client</p>
                    <p className="font-medium">{call.client_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="font-medium">{call.company_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-gray-500">Call Type</p>
                    <p className="font-medium capitalize">{call.call_type}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50">
                <AlertCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-gray-500">Prospect Status</p>
                  <p className="font-medium">{call.prospect_type}</p>
                  <p className="text-sm text-gray-600 mt-1">{call.next_action}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Call Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{call.summary}</p>
              
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-3">Key Points</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {call.key_points?.map((point, index) => (
                    <li key={index} className="text-gray-700">{point}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {tasks && tasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold">{task.title}</h3>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge variant="secondary" className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                      {task.description && (
                        <p className="mt-2 text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                        <span>Assigned to: {task.assignee || 'Unassigned'}</span>
                        {task.due_date && (
                          <span>
                            Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Full Transcription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{call.transcription}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CallDetails;