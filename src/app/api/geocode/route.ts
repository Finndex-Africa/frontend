import { NextRequest, NextResponse } from "next/server";

type NominatimResult = {
  lat?: string;
  lon?: string;
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json(
      { error: "Query parameter q is required" },
      { status: 400 },
    );
  }

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    const response = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "FindAfriq/1.0 (property geocoding)",
      },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Geocoding request failed" },
        { status: 502 },
      );
    }

    const results = (await response.json()) as NominatimResult[];
    const first = results[0];
    if (!first?.lat || !first?.lon) {
      return NextResponse.json({ lat: null, lng: null }, { status: 404 });
    }

    const lat = Number(first.lat);
    const lng = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ lat: null, lng: null }, { status: 404 });
    }

    return NextResponse.json({ lat, lng });
  } catch {
    return NextResponse.json(
      { error: "Geocoding service unavailable" },
      { status: 502 },
    );
  }
}
