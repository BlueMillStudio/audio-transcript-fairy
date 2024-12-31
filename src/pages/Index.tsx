import { CallsTable } from "@/components/CallsTable";
import { AudioUploader } from "@/components/AudioUploader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "@/components/ui/chart";
import { PhoneCall, Target, ChartBar, CheckSquare } from "lucide-react";

const statsData = [
  {
    title: "Active Calls",
    value: "0",
    icon: PhoneCall,
  },
  {
    title: "Campaigns",
    value: "0",
    icon: Target,
  },
  {
    title: "Sales",
    value: "0",
    icon: ChartBar,
  },
  {
    title: "Tasks Finished",
    value: "0",
    icon: CheckSquare,
  },
];

const chartData = [
  { name: "Jan", calls: 40, sales: 24 },
  { name: "Feb", calls: 30, sales: 18 },
  { name: "Mar", calls: 20, sales: 12 },
  { name: "Apr", calls: 27, sales: 15 },
  { name: "May", calls: 18, sales: 9 },
  { name: "Jun", calls: 23, sales: 14 },
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <BarChart
              data={chartData}
              categories={["calls", "sales"]}
              index="name"
              colors={["sky", "blue"]}
              yAxisWidth={30}
              height={350}
            />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No active campaigns</p>
          </CardContent>
        </Card>
      </div>

      <CallsTable />
    </div>
  );
};

export default Index;