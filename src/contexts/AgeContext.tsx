import { createContext, useContext, useState, ReactNode } from 'react';
import { storage } from '../lib/storage';

interface AgeContextType {
  ageStatus: 'adult' | 'under18' | null;
  setAgeStatus: (status: 'adult' | 'under18') => void;
}

const AgeContext = createContext<AgeContextType | undefined>(undefined);

export function AgeProvider({ children }: { children: ReactNode }) {
  const [ageStatus, setAgeStatusState] = useState<'adult' | 'under18' | null>(storage.getAgeStatus());

  const setAgeStatus = (status: 'adult' | 'under18') => {
    storage.setAgeStatus(status);
    setAgeStatusState(status);
  };

  return (
    <AgeContext.Provider value={{ ageStatus, setAgeStatus }}>
      {children}
    </AgeContext.Provider>
  );
}

export const useAge = () => {
  const context = useContext(AgeContext);
  if (context === undefined) {
    throw new Error('useAge must be used within an AgeProvider');
  }
  return context;
};
