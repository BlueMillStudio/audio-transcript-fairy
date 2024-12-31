import { CallsTable } from "@/components/CallsTable";
import { AudioUploader } from "@/components/AudioUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneCall, Target, ChartBar, CheckSquare } from "lucide-react";
import { KanbanBoard } from "@/components/KanbanBoard";

const statsData = [
  {
    title: "Active Calls",
    value: "0",
    icon: PhoneCall,
  },
  {
    title: "Total Leads",
    value: "0",
    icon: Target,
  },
  {
    title: "Proposals",
    value: "0",
    icon: ChartBar,
  },
  {
    title: "Closed Deals",
    value: "0",
    icon: CheckSquare,
  },
];

const Index = () => {
  return (
    <div className="w-full space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <AudioUploader />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <KanbanBoard />

      <CallsTable />
    </div>
  );
};

export default Index;