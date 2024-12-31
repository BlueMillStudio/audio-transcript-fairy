import React, { createContext, useContext, useState } from 'react';

interface CampaignContextType {
  dateRange: string;
  filterStatus: string;
  searchQuery: string;
  setDateRange: (value: string) => void;
  setFilterStatus: (value: string) => void;
  setSearchQuery: (value: string) => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider = ({ children }: { children: React.ReactNode }) => {
  const [dateRange, setDateRange] = useState("week");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <CampaignContext.Provider
      value={{
        dateRange,
        filterStatus,
        searchQuery,
        setDateRange,
        setFilterStatus,
        setSearchQuery,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

export const useCampaignContext = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaignContext must be used within a CampaignProvider');
  }
  return context;
};