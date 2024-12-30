import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MessageSquare, Phone, Building2, User, AlertCircle } from "lucide-react";

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

  if (isLoading) return <div>Loading...</div>;
  if (!call) return null;

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
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
              <div className="flex items-center gap-2 mt-4 p-4 rounded-lg bg-gray-50">
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