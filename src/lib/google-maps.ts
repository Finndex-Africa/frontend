export type MapCoordinates = {
  lat: number;
  lng: number;
};

export type MapLocationInput = {
  location?: string | null;
  mapCoordinates?: MapCoordinates | null;
};

const COORDINATE_PATTERN =
  /^(-?\d{1,3}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/;

function isValidLatitude(lat: number): boolean {
  return Number.isFinite(lat) && lat >= -90 && lat <= 90;
}

function isValidLongitude(lng: number): boolean {
  return Number.isFinite(lng) && lng >= -180 && lng <= 180;
}

export function parseCoordinatesFromLocation(
  location?: string | null,
): MapCoordinates | null {
  if (!location) return null;

  const trimmed = location.trim();
  const match = trimmed.match(COORDINATE_PATTERN);
  if (!match) return null;

  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (!isValidLatitude(lat) || !isValidLongitude(lng)) return null;

  return { lat, lng };
}

export function normalizeMapCoordinates(
  coordinates?: MapCoordinates | null,
): MapCoordinates | null {
  if (!coordinates) return null;

  const lat = Number(coordinates.lat);
  const lng = Number(coordinates.lng);
  if (!isValidLatitude(lat) || !isValidLongitude(lng)) return null;

  return { lat, lng };
}

export function resolveMapCoordinates(
  input: MapLocationInput,
): MapCoordinates | null {
  return (
    normalizeMapCoordinates(input.mapCoordinates) ??
    parseCoordinatesFromLocation(input.location)
  );
}

export function buildGoogleMapsEmbedUrl(input: MapLocationInput): string {
  const coordinates = resolveMapCoordinates(input);

  if (coordinates) {
    const { lat, lng } = coordinates;
    return `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  }

  const location = input.location?.trim();
  if (location) {
    return `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;
  }

  return "https://www.google.com/maps?output=embed";
}

export async function geocodeAddress(
  address: string,
): Promise<MapCoordinates | null> {
  const trimmed = address.trim();
  if (!trimmed) return null;

  const parsed = parseCoordinatesFromLocation(trimmed);
  if (parsed) return parsed;

  try {
    const response = await fetch(
      `/api/geocode?q=${encodeURIComponent(trimmed)}`,
    );
    if (!response.ok) return null;

    const data = (await response.json()) as {
      lat?: number;
      lng?: number;
    };

    return normalizeMapCoordinates(
      data.lat != null && data.lng != null
        ? { lat: data.lat, lng: data.lng }
        : null,
    );
  } catch {
    return null;
  }
}

export async function buildGoogleMapsEmbedUrlAsync(
  input: MapLocationInput,
): Promise<string> {
  const existing = resolveMapCoordinates(input);
  if (existing) {
    return buildGoogleMapsEmbedUrl({ mapCoordinates: existing });
  }

  if (input.location?.trim()) {
    const geocoded = await geocodeAddress(input.location);
    if (geocoded) {
      return buildGoogleMapsEmbedUrl({ mapCoordinates: geocoded });
    }
  }

  return buildGoogleMapsEmbedUrl(input);
}
