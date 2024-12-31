import { CallsTable } from "@/components/CallsTable";
import { AudioUploader } from "@/components/AudioUploader";

const Index = () => {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <main className="flex-1">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <AudioUploader />
          </div>
          <CallsTable />
        </div>
      </main>
    </div>
  );
};

export default Index;