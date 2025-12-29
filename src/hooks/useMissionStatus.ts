import { useState, useEffect } from 'react';
import { MissionStatus } from '../types';

export function useMissionStatus() {
  const [status, setStatus] = useState<MissionStatus>('NORMAL');

  useEffect(() => {
    const interval = setInterval(() => {
      // 10% chance to change status
      if (Math.random() < 0.1) {
        const statuses: MissionStatus[] = ['NORMAL', 'CAUTION', 'RISK'];
        const currentIndex = statuses.indexOf(status);
        // Prefer staying in current status or moving to adjacent
        const weights = [0.7, 0.2, 0.1]; // 70% stay, 20% adjacent, 10% opposite
        const rand = Math.random();

        let newStatus: MissionStatus;
        if (rand < weights[0]) {
          newStatus = status; // Stay same
        } else if (rand < weights[0] + weights[1]) {
          // Move to adjacent
          if (currentIndex === 0) newStatus = 'CAUTION';
          else if (currentIndex === 1) newStatus = Math.random() > 0.5 ? 'NORMAL' : 'RISK';
          else newStatus = 'CAUTION';
        } else {
          // Move to opposite
          if (currentIndex === 0) newStatus = 'RISK';
          else if (currentIndex === 2) newStatus = 'NORMAL';
          else newStatus = Math.random() > 0.5 ? 'NORMAL' : 'RISK';
        }

        setStatus(newStatus);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [status]);

  return status;
}

