import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('q') || '';
  const query = rawQuery.trim();

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    // Tự động bổ sung "Vietnam" nếu người dùng chỉ gõ tên riêng
    const searchQuery = query.toLowerCase().includes('vietnam') ? query : `${query}, Vietnam`;

    // Gọi đồng thời cả 2 Provider Geocoding lớn nhất hoàn toàn FREE
    const [nominatimRes, photonRes] = await Promise.allSettled([
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=vn`, {
        headers: { 'User-Agent': 'FLASHY-App-Search/1.0', 'Accept-Language': 'vi' },
        signal: AbortSignal.timeout(5000),
      }).then(r => r.json()),
      fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&lang=en&lat=10.7769&lon=106.7009`, {
        signal: AbortSignal.timeout(5000),
      }).then(r => r.json())
    ]);

    let results: any[] = [];

    // Parse kết quả từ Nominatim
    if (nominatimRes.status === 'fulfilled' && Array.isArray(nominatimRes.value)) {
      results.push(...nominatimRes.value.map((item: any) => ({
        place_id: `nom-${item.place_id}`,
        display_name: item.display_name,
        name: item.name || item.display_name?.split(',')[0]?.trim() || 'Địa điểm',
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      })));
    }

    // Parse kết quả từ Photon (GeoJSON)
    if (photonRes.status === 'fulfilled' && photonRes.value?.features) {
      const photonItems = photonRes.value.features.map((f: any) => {
        const p = f.properties;
        const nameParts = [p.name, p.street, p.district, p.city, p.country].filter(Boolean);
        return {
          place_id: `pho-${p.osm_id || Math.random()}`,
          display_name: nameParts.join(', '),
          name: p.name || nameParts[0] || 'Địa điểm',
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0],
          isVietnam: (p.country || '').toLowerCase().includes('vietnam') || (p.country || '').toLowerCase().includes('việt nam')
        };
      });
      // Ưu tiên các địa điểm tại Việt Nam
      photonItems.sort((a: any, b: any) => (b.isVietnam ? 1 : 0) - (a.isVietnam ? 1 : 0));
      results.push(...photonItems);
    }

    // Loại bỏ các địa điểm trùng lặp gần tọa độ nhau
    const uniqueResults = results.filter((item, index, self) =>
      !isNaN(item.lat) &&
      !isNaN(item.lon) &&
      index === self.findIndex((t) => (
        Math.abs(t.lat - item.lat) < 0.001 && Math.abs(t.lon - item.lon) < 0.001
      ))
    );

    return NextResponse.json(uniqueResults.slice(0, 6));
  } catch (error) {
    console.error('Geocode search error:', error);
    return NextResponse.json([]);
  }
}
