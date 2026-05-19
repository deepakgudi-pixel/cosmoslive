import axios from 'axios';
import { z } from 'zod';
import { getCache, setCache } from '../lib/cache.js';
import { TTL, StarlinkPositionSchema } from './types.js';
import type { StarlinkPosition } from './types.js';

// Re-use the raw schema shape for parsing SpaceX API responses.
// The canonical StarlinkPositionSchema in types.ts is the single source
// of truth for the normalised output.
const RawStarlinkEntry = z.object({
  id: z.string(),
  spaceTrack: z.object({ OBJECT_NAME: z.string().optional() }).optional(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  height_km: z.number().nullable().optional(),
  velocity_kms: z.number().nullable().optional(),
  launch: z.string().nullable().optional(),
});

export async function fetchStarlinkPositions(): Promise<StarlinkPosition[]> {
  const cacheKey = 'starlink:positions';
  const cached = await getCache<StarlinkPosition[]>(cacheKey);
  if (cached) return z.array(StarlinkPositionSchema).parse(cached);

  const { data } = await axios.get('https://api.spacexdata.com/v4/starlink', {
    timeout: 10000,
  });

  const raw = Array.isArray(data) ? data : [];
  const positions: StarlinkPosition[] = raw
    .map((s: unknown): StarlinkPosition | null => {
      const parsed = RawStarlinkEntry.safeParse(s);
      if (!parsed.success || parsed.data.latitude == null || parsed.data.longitude == null) return null;
      return {
        id: parsed.data.id,
        name: parsed.data.spaceTrack?.OBJECT_NAME || 'STARLINK',
        lat: parsed.data.latitude,
        lng: parsed.data.longitude,
        height: parsed.data.height_km ?? null,
        velocity: parsed.data.velocity_kms ?? null,
        launch: parsed.data.launch,
      };
    })
    .filter(isStarlinkPosition);

  z.array(StarlinkPositionSchema).parse(positions);
  await setCache(cacheKey, positions, TTL.STARLINK);
  return positions;
}

function isStarlinkPosition(position: StarlinkPosition | null): position is StarlinkPosition {
  return position !== null;
}
