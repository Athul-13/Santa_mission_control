import { useGeographicRoute } from '../contexts/GeographicRouteContext';
import { useGeographicSantaMovement } from '../hooks/useGeographicSantaMovement';
import { SantaPositionProvider } from '../contexts/SantaPositionContext';

/**
 * Wrapper component that calculates Santa's position and provides it via context
 * This allows MissionHeader and other components to access Santa's position
 */
export function SantaPositionProviderWrapper({ children }: { children: React.ReactNode }) {
  const { route } = useGeographicRoute();
  const santaPosition = useGeographicSantaMovement(route);

  return (
    <SantaPositionProvider santaPosition={santaPosition}>
      {children}
    </SantaPositionProvider>
  );
}

