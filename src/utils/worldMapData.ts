/**
 * Cinematic world map - recognizable continent outlines
 * All coordinates in 0-100% space, aligned for geographic recognition
 */

export const WORLD_OUTLINES = {
  // North America - recognizable with Gulf of Mexico
  northAmerica: `M 4 6 L 6 4 L 10 6 L 14 8 L 18 10 L 22 12 L 24 14 L 26 16 L 27 18 L 27 22 L 26 26 L 25 30 L 24 34 L 22 38 L 20 42 L 18 44 L 16 46 L 14 47 L 12 48 L 10 47 L 8 45 L 6 42 L 5 38 L 4 34 L 4 30 L 4 26 L 4 22 L 4 18 L 4 14 L 4 10 Z
                 M 12 26 L 14 24 L 16 26 L 18 28 L 20 30 L 18 32 L 16 32 L 14 30 Z
                 M 8 16 L 10 14 L 12 16 L 10 18 Z`,
  
  // South America - elongated vertical
  southAmerica: `M 8 40 L 10 38 L 12 40 L 14 43 L 15 46 L 16 50 L 16 54 L 16 58 L 16 62 L 16 66 L 15 70 L 14 74 L 12 78 L 10 80 L 8 82 L 6 80 L 5 76 L 5 72 L 5 68 L 5 64 L 5 60 L 5 56 L 5 52 L 5 48 L 5 44 L 6 42 Z
                 M 10 56 L 12 54 L 14 56 L 12 58 Z`,
  
  // Europe - with peninsulas
  europe: `M 44 8 L 46 6 L 48 8 L 50 10 L 52 12 L 54 14 L 56 16 L 58 18 L 59 20 L 59 24 L 58 28 L 56 32 L 54 36 L 52 40 L 50 42 L 48 43 L 46 42 L 44 40 L 44 36 L 44 32 L 44 28 L 44 24 L 44 20 L 44 16 L 44 12 Z
           M 48 16 L 50 14 L 52 16 L 54 18 L 52 20 L 50 20 Z
           M 46 22 L 48 20 L 50 22 L 48 24 Z
           M 50 26 L 52 24 L 54 26 L 52 28 Z`,
  
  // Africa - vertical elongated
  africa: `M 46 18 L 48 16 L 50 18 L 52 20 L 54 22 L 56 26 L 58 30 L 59 34 L 60 38 L 60 42 L 60 46 L 60 50 L 59 54 L 58 58 L 56 62 L 54 66 L 52 68 L 50 69 L 48 68 L 46 66 L 46 62 L 46 58 L 46 54 L 46 50 L 46 46 L 46 42 L 46 38 L 46 34 L 46 30 L 46 26 L 46 22 Z
           M 50 30 L 52 28 L 54 30 L 52 32 Z
           M 48 48 L 50 46 L 52 48 L 50 50 Z`,
  
  // Asia - large continent
  asia: `M 18 4 L 22 2 L 26 4 L 30 6 L 34 8 L 38 10 L 42 12 L 46 14 L 50 16 L 54 18 L 58 20 L 62 22 L 66 24 L 70 26 L 74 28 L 78 30 L 82 32 L 86 34 L 88 36 L 89 38 L 89 40 L 88 42 L 86 44 L 84 46 L 81 48 L 78 50 L 75 52 L 71 54 L 67 56 L 63 57 L 59 58 L 55 57 L 51 56 L 47 54 L 43 52 L 39 50 L 35 48 L 31 46 L 28 44 L 26 42 L 24 40 L 22 38 L 21 36 L 20 34 L 20 32 L 20 30 L 20 28 L 20 26 L 20 24 L 20 22 L 20 20 L 20 18 L 20 16 L 20 14 L 20 12 L 20 10 L 20 8 L 20 6 Z
         M 26 16 L 28 14 L 30 16 L 32 18 L 30 20 L 28 20 Z
         M 30 20 L 32 18 L 34 20 L 32 22 Z
         M 40 22 L 42 20 L 44 22 L 46 24 L 44 26 L 42 26 Z
         M 48 26 L 50 24 L 52 26 L 50 28 Z
         M 24 30 L 26 28 L 28 30 L 26 32 Z
         M 28 34 L 30 32 L 32 34 L 30 36 Z`,
  
  // Oceania/Australia
  oceania: `M 24 54 L 28 52 L 32 54 L 36 56 L 38 58 L 40 60 L 42 62 L 40 64 L 36 66 L 32 66 L 28 64 L 26 62 L 24 60 L 24 58 Z
            M 30 58 L 32 56 L 34 58 L 36 60 L 34 62 L 32 62 Z
            M 28 60 L 30 58 L 32 60 L 30 62 Z`,
  
  // Greenland
  greenland: `M 14 2 L 16 1 L 18 2 L 20 3 L 22 4 L 24 5 L 22 7 L 20 7 L 18 6 L 16 5 Z`,
  
  // Madagascar
  madagascar: `M 54 48 L 56 46 L 58 48 L 60 50 L 62 52 L 60 54 L 58 54 L 56 52 Z`,
  
  // Japan
  japan: `M 34 24 L 36 22 L 38 24 L 40 26 L 38 28 L 36 28 Z
          M 36 26 L 38 24 L 40 26 L 38 28 Z
          M 38 28 L 40 26 L 42 28 L 40 30 Z`,
  
  // British Isles
  britishIsles: `M 44 14 L 46 12 L 48 14 L 50 16 L 48 18 L 46 18 Z
                 M 46 16 L 48 14 L 50 16 L 48 18 Z`,
  
  // Indonesia/Philippines
  indonesia: `M 28 44 L 30 42 L 32 44 L 34 46 L 32 48 L 30 48 Z
              M 30 46 L 32 44 L 34 46 L 32 48 Z
              M 32 48 L 34 46 L 36 48 L 34 50 Z
              M 34 50 L 36 48 L 38 50 L 36 52 Z`,
  
  // Arabian Peninsula
  arabia: `M 56 30 L 58 28 L 60 30 L 62 32 L 60 34 L 58 34 Z`,
  
  // Indian subcontinent
  india: `M 48 36 L 50 34 L 52 36 L 54 38 L 52 40 L 50 40 Z
          M 50 38 L 52 36 L 54 38 L 52 40 Z`,
};

/**
 * Generate latitude lines (horizontal arcs) - subtle projection cues
 */
export function generateLatitudeLines(): string[] {
  const latitudes = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90];
  return latitudes.map((lat) => {
    const y = (lat / 180) * 100;
    const curvature = Math.abs(y - 50) * 0.25;
    return `M 0 ${y} Q 50 ${y + curvature} 100 ${y}`;
  });
}

/**
 * Generate longitude lines (vertical curves) - subtle projection cues
 */
export function generateLongitudeLines(): string[] {
  const longitudes = [0, 30, 60, 90, 120, 150, 180, -150, -120, -90, -60, -30];
  return longitudes.map((lon) => {
    const x = ((lon + 180) / 360) * 100;
    return `M ${x} 0 Q ${x} 50 ${x} 100`;
  });
}
