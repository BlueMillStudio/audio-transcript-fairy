import { CallsTable } from "@/components/CallsTable";
import { AudioUploader } from "@/components/AudioUploader";

const Index = () => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <AudioUploader />
      </div>
      <CallsTable />
    </div>
  );
};

export default Index;