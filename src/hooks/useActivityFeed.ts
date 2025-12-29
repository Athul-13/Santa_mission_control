import { useState, useEffect, useRef } from 'react';
import { ActivityEvent, EventType, EventSeverity } from '../types';

const EVENT_TEMPLATES: {
  type: EventType;
  severity: EventSeverity;
  messages: string[];
}[] = [
  {
    type: 'Region',
    severity: 'INFO',
    messages: [
      'Entering North Pacific Sector',
      'Crossing International Date Line',
      'Approaching Asia-Pacific Region',
      'Entering European Airspace',
      'Crossing Atlantic Ocean',
    ],
  },
  {
    type: 'Anomaly',
    severity: 'WARNING',
    messages: [
      'Minor turbulence detected ahead',
      'Weather pattern shifting',
      'Traffic advisory: Commercial flight in vicinity',
      'Navigation system calibration in progress',
      'Minor communication delay detected',
    ],
  },
  {
    type: 'Recommendation',
    severity: 'INFO',
    messages: [
      'New route optimization available',
      'Weather advisory received',
      'Efficiency recommendation generated',
      'Security protocol update available',
    ],
  },
  {
    type: 'Route',
    severity: 'SUCCESS',
    messages: [
      'Route updated: Optimization applied',
      'Waypoint sequence reorganized',
      'Weather detour added successfully',
      'Efficiency shortcut implemented',
      'Route modification complete',
    ],
  },
];

export function useActivityFeed(onRouteUpdate?: (message: string) => void) {
  const [events, setEvents] = useState<ActivityEvent[]>(() => {
    // Initial event
    return [
      {
        id: `event-${Date.now()}`,
        type: 'Route',
        severity: 'SUCCESS',
        message: 'Mission initialized: Operation Yuletide active',
        timestamp: new Date(),
      },
    ];
  });

  const onRouteUpdateRef = useRef(onRouteUpdate);
  useEffect(() => {
    onRouteUpdateRef.current = onRouteUpdate;
  }, [onRouteUpdate]);

  // Generate new events every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
      const message = template.messages[Math.floor(Math.random() * template.messages.length)];

      const newEvent: ActivityEvent = {
        id: `event-${Date.now()}-${Math.random()}`,
        type: template.type,
        severity: template.severity,
        message,
        timestamp: new Date(),
      };

      setEvents((prev) => {
        const updated = [...prev, newEvent];
        // Keep only last 20 events
        return updated.slice(-20);
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const addEvent = (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newEvent: ActivityEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };

    setEvents((prev) => {
      const updated = [...prev, newEvent];
      return updated.slice(-20);
    });

    // Call route update callback if provided
    if (onRouteUpdateRef.current && event.type === 'Route') {
      onRouteUpdateRef.current(event.message);
    }
  };

  return { events, addEvent };
}

