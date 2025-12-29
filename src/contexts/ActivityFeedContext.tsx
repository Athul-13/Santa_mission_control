import React, { createContext, useContext } from 'react';
import { useActivityFeed } from '../hooks/useActivityFeed';

interface ActivityFeedContextType {
  events: ReturnType<typeof useActivityFeed>['events'];
  addEvent: ReturnType<typeof useActivityFeed>['addEvent'];
}

const ActivityFeedContext = createContext<ActivityFeedContextType | undefined>(undefined);

export function ActivityFeedProvider({ children }: { children: React.ReactNode }) {
  const { events, addEvent } = useActivityFeed();

  return (
    <ActivityFeedContext.Provider value={{ events, addEvent }}>
      {children}
    </ActivityFeedContext.Provider>
  );
}

export function useActivityFeedContext() {
  const context = useContext(ActivityFeedContext);
  if (context === undefined) {
    throw new Error('useActivityFeedContext must be used within ActivityFeedProvider');
  }
  return context;
}

