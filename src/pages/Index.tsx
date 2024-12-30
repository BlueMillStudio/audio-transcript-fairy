import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { CallsTable } from "@/components/CallsTable";
import { AudioUploader } from "@/components/AudioUploader";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <AudioUploader />
            </div>
            <CallsTable />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;