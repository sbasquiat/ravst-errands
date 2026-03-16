/**
 * Geocoding utility using Google Places API + Haversine distance
 * Server-side only — API key stays on the server
 */

/** Autocomplete suggestion (no coordinates — use getPlaceCoordinates to resolve) */
export interface PlaceSuggestion {
  placeId: string;
  displayName: string;
  /** Structured sub-parts for secondary text */
  mainText: string;
  secondaryText: string;
}

/** Resolved place with coordinates */
export interface PlaceDetails {
  lat: number;
  lng: number;
  formattedAddress: string;
}

// Keep legacy interface for anything that already imports it
export interface GeocodingResult {
  address: string;
  lat: number;
  lng: number;
  displayName: string;
}

/* ------------------------------------------------------------------ */
/*  Google Places API (New) — Autocomplete                             */
/* ------------------------------------------------------------------ */

interface GoogleSuggestion {
  placePrediction: {
    placeId: string;
    text: { text: string };
    structuredFormat: {
      mainText: { text: string };
      secondaryText: { text: string };
    };
  };
}

interface GoogleAutocompleteResponse {
  suggestions?: GoogleSuggestion[];
}

/**
 * Search for address suggestions using Google Places API (New)
 * Biased towards Ireland with location weighting near Dublin
 */
export async function searchPlaces(
  query: string,
  limit = 5
): Promise<PlaceSuggestion[]> {
  if (!query || query.length < 3) return [];

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_MAPS_API_KEY is not set");
    return [];
  }

  const response = await fetch(
    "https://places.googleapis.com/v1/places:autocomplete",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
      },
      body: JSON.stringify({
        input: query,
        includedPrimaryTypes: ["street_address", "subpremise", "premise", "point_of_interest", "establishment"],
        includedRegionCodes: ["ie"],
        locationBias: {
          circle: {
            center: { latitude: 53.3498, longitude: -6.2603 },
            radius: 50000.0,
          },
        },
      }),
    }
  );

  if (!response.ok) {
    console.error("Google Places Autocomplete error:", response.status, await response.text());
    return [];
  }

  const data: GoogleAutocompleteResponse = await response.json();

  if (!data.suggestions) return [];

  return data.suggestions
    .filter((s) => s.placePrediction)
    .slice(0, limit)
    .map((s) => ({
      placeId: s.placePrediction.placeId,
      displayName: s.placePrediction.text.text,
      mainText: s.placePrediction.structuredFormat.mainText.text,
      secondaryText: s.placePrediction.structuredFormat.secondaryText.text,
    }));
}

/* ------------------------------------------------------------------ */
/*  Google Places API (New) — Place Details                            */
/* ------------------------------------------------------------------ */

interface GooglePlaceDetailsResponse {
  location: {
    latitude: number;
    longitude: number;
  };
  formattedAddress: string;
}

/**
 * Get coordinates for a place by its Google Place ID
 */
export async function getPlaceCoordinates(
  placeId: string
): Promise<PlaceDetails | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_MAPS_API_KEY is not set");
    return null;
  }

  const response = await fetch(
    `https://places.googleapis.com/v1/places/${placeId}`,
    {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "location,formattedAddress",
      },
    }
  );

  if (!response.ok) {
    console.error("Google Place Details error:", response.status, await response.text());
    return null;
  }

  const data: GooglePlaceDetailsResponse = await response.json();

  return {
    lat: data.location.latitude,
    lng: data.location.longitude,
    formattedAddress: data.formattedAddress,
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate route distance with intermediate stops
 * Uses Haversine with a 1.3x multiplier for city routing
 * (straight-line * 1.3 ≈ typical city driving distance)
 */
export function calculateRouteDistance(
  stops: { lat: number; lng: number }[]
): number {
  if (stops.length < 2) return 0;

  let totalStraightLine = 0;
  for (let i = 0; i < stops.length - 1; i++) {
    totalStraightLine += haversineDistance(
      stops[i].lat,
      stops[i].lng,
      stops[i + 1].lat,
      stops[i + 1].lng
    );
  }

  // City routing multiplier: roads aren't straight lines
  const CITY_MULTIPLIER = 1.3;
  return Math.round(totalStraightLine * CITY_MULTIPLIER * 100) / 100;
}
