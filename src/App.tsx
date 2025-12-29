import { GeographicRouteProvider } from './contexts/GeographicRouteContext';
import { ActivityFeedProvider } from './contexts/ActivityFeedContext';
import { SantaPositionProviderWrapper } from './components/SantaPositionProviderWrapper';
import { MissionHeader } from './components/MissionHeader';
import { MissionMap } from './components/MissionMap';
import { DecisionPanel } from './components/DecisionPanel';
import { ActivityFeed } from './components/ActivityFeed';
import { RadarWidget } from './components/RadarWidget';
import { SystemInfoCard } from './components/SystemInfoCard';

function App() {
  return (
    <GeographicRouteProvider>
      <SantaPositionProviderWrapper>
      <ActivityFeedProvider>
      <div className="w-screen h-screen bg-slate-950 overflow-hidden">
        {/* Mission Header */}
        <MissionHeader />

        {/* Main Layout */}
        <div className="flex h-screen pt-20">
          {/* Left Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Mission Map */}
            <div className="flex-1">
              <MissionMap />
            </div>
            {/* Activity Feed */}
            <ActivityFeed />
          </div>

          {/* Right Sidebar - Decision Panel */}
          <DecisionPanel />
        </div>

        {/* Floating Widgets */}
        <RadarWidget />
        <SystemInfoCard />
      </div>
      </ActivityFeedProvider>
      </SantaPositionProviderWrapper>
    </GeographicRouteProvider>
  );
}

export default App;

