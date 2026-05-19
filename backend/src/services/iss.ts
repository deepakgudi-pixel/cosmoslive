import axios from 'axios';
import { z } from 'zod';
import { getCache, setCache } from '../lib/cache.js';
import { TTL, ISSPositionSchema, ISSCrewResponseSchema, CrewMemberSchema } from './types.js';
import type { ISSPosition, CrewMember } from './types.js';

const CREW_SOURCES = [
  'https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json',
  'http://api.open-notify.org/astros.json',
] as const;

export async function fetchISSPosition(): Promise<ISSPosition> {
  const cacheKey = 'iss:position';
  const cached = await getCache<ISSPosition>(cacheKey);
  if (cached) return ISSPositionSchema.parse(cached);

  let result: ISSPosition | null = null;
  let lastError: unknown;

  // Try primary API
  try {
    const { data } = await axios.get('https://api.wheretheiss.at/v1/satellites/25544', {
      timeout: 8000, // Reduced timeout so we failover faster
    });

    result = {
      lat: data.latitude,
      lng: data.longitude,
      altitude: data.altitude,
      velocity: data.velocity,
      timestamp: Math.floor(data.timestamp),
    };
  } catch (err) {
    lastError = err;
    console.warn('[ISS API] wheretheiss.at failed, falling back to open-notify...', (err as Error).message);
  }

  // Try fallback API if primary failed
  if (!result) {
    try {
      const { data } = await axios.get('http://api.open-notify.org/iss-now.json', {
        timeout: 8000,
      });

      result = {
        lat: parseFloat(data.iss_position.latitude),
        lng: parseFloat(data.iss_position.longitude),
        // Open-notify doesn't provide alt/vel, so we use average constants
        altitude: 418.0, 
        velocity: 27600,
        timestamp: data.timestamp,
      };
    } catch (err) {
      lastError = err;
    }
  }

  if (!result) {
    throw lastError || new Error('All ISS position APIs failed');
  }

  ISSPositionSchema.parse(result);
  await setCache(cacheKey, result, TTL.ISS_POSITION);
  return result;
}

export async function fetchISSCrew(): Promise<CrewMember[]> {
  const cacheKey = 'iss:crew';
  const cached = await getCache<CrewMember[]>(cacheKey);
  if (cached) return z.array(CrewMemberSchema).parse(cached);

  let lastError: unknown;

  for (const source of CREW_SOURCES) {
    try {
      const { data } = await axios.get(source, { timeout: 10000 });
      const parsed = ISSCrewResponseSchema.parse(data);
      const crew = (parsed.people || []).filter((p) => p.craft.trim().toUpperCase() === 'ISS');
      const validated = z.array(CrewMemberSchema).parse(crew);

      if (validated.length > 0) {
        await setCache(cacheKey, validated, TTL.ASTRONAUTS);
        return validated;
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError) throw lastError;
  return [];
}
