import axios from 'axios';
import { z } from 'zod';
import { getCache, setCache } from '../lib/cache';
import { TTL, ISSPositionSchema, ISSCrewResponseSchema, CrewMemberSchema } from './types';
import type { ISSPosition, CrewMember } from './types';

const CREW_SOURCES = [
  'https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json',
  'http://api.open-notify.org/astros.json',
] as const;

export async function fetchISSPosition(): Promise<ISSPosition> {
  const cacheKey = 'iss:position';
  const cached = await getCache(cacheKey);
  if (cached) return ISSPositionSchema.parse(cached);

  const { data } = await axios.get('https://api.wheretheiss.at/v1/satellites/25544', {
    timeout: 10000,
  });

  const result: ISSPosition = {
    lat: data.latitude,
    lng: data.longitude,
    altitude: data.altitude,
    velocity: data.velocity,
    timestamp: Math.floor(data.timestamp),
  };

  ISSPositionSchema.parse(result);
  await setCache(cacheKey, result, TTL.ISS_POSITION);
  return result;
}

export async function fetchISSCrew(): Promise<CrewMember[]> {
  const cacheKey = 'iss:crew';
  const cached = await getCache(cacheKey);
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
