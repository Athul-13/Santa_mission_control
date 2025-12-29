import { useState, useEffect } from 'react';

export function SystemInfoCard() {
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toUTCString().split(' ')[4] || '00:00:00';
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const utcTime = now.toUTCString().split(' ')[4] || '00:00:00';
      setTime(utcTime);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-24 right-6 bg-slate-950/80 backdrop-blur-sm border border-slate-800/50 rounded-lg px-4 py-2 font-mono text-xs text-slate-500">
      <div>SYSTEM: OPERATIONAL</div>
      <div className="text-cyan-400">UPLINK: STABLE</div>
      <div>TIME: {time} UTC</div>
    </div>
  );
}

