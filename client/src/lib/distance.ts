/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Estimate walking time based on distance
 * Assumes average walking speed of 1.4 m/s (5 km/h)
 */
export function estimateWalkingTime(distanceKm: number): number {
  const walkingSpeedKmPerHour = 5;
  const minutes = Math.round((distanceKm / walkingSpeedKmPerHour) * 60);
  return Math.max(minutes, 1); // Minimum 1 minute
}

/**
 * Estimate taxi time based on distance
 * Assumes average taxi speed of 20 km/h in Marrakech traffic
 */
export function estimateTaxiTime(distanceKm: number): number {
  const taxiSpeedKmPerHour = 20;
  const minutes = Math.round((distanceKm / taxiSpeedKmPerHour) * 60);
  return Math.max(minutes, 2); // Minimum 2 minutes
}

/**
 * Get distance category for UI display
 */
export function getDistanceCategory(distanceKm: number): string {
  if (distanceKm < 0.2) return "Very Close";
  if (distanceKm < 0.5) return "5-Minute Walk";
  if (distanceKm < 1) return "10-Minute Walk";
  if (distanceKm < 2) return "15-20 Minute Walk";
  if (distanceKm < 3) return "Taxi Recommended";
  return "Far";
}

/**
 * Filter places by walking distance
 */
export function filterByWalkingDistance(
  places: any[],
  riadCoords: [number, number],
  maxDistanceKm: number
): any[] {
  return places.filter(place => {
    const distance = calculateDistance(
      riadCoords[0],
      riadCoords[1],
      place.coordinates[0],
      place.coordinates[1]
    );
    return distance <= maxDistanceKm;
  });
}

/**
 * Sort places by distance from riad
 */
export function sortByDistance(
  places: any[],
  riadCoords: [number, number]
): any[] {
  return [...places].sort((a, b) => {
    const distA = calculateDistance(
      riadCoords[0],
      riadCoords[1],
      a.coordinates[0],
      a.coordinates[1]
    );
    const distB = calculateDistance(
      riadCoords[0],
      riadCoords[1],
      b.coordinates[0],
      b.coordinates[1]
    );
    return distA - distB;
  });
}
