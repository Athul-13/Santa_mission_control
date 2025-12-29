import React, { createContext, useContext } from 'react';
import { GeographicSantaPosition } from '../types';

interface SantaPositionContextType {
  santaPosition: GeographicSantaPosition;
}

const SantaPositionContext = createContext<SantaPositionContextType | undefined>(undefined);

export function SantaPositionProvider({ 
  children, 
  santaPosition 
}: { 
  children: React.ReactNode;
  santaPosition: GeographicSantaPosition;
}) {
  return (
    <SantaPositionContext.Provider value={{ santaPosition }}>
      {children}
    </SantaPositionContext.Provider>
  );
}

export function useSantaPosition() {
  const context = useContext(SantaPositionContext);
  if (context === undefined) {
    throw new Error('useSantaPosition must be used within a SantaPositionProvider');
  }
  return context.santaPosition;
}

