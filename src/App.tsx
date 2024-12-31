import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import Tasks from "./pages/Tasks";
import CallDetails from "./pages/CallDetails";
import Campaigns from "./pages/Campaigns";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Contacts from "./pages/Contacts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex min-h-screen bg-background">
          <Sidebar className="border-r" />
          <main className="flex-1 p-8">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/call/:id" element={<CallDetails />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;