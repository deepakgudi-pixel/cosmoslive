import axios from 'axios';
import { z } from 'zod';
import { getCache, setCache } from '../lib/cache.js';
import { TTL, LaunchSchema, SpaceXLaunchSchema, SpaceXRocketSchema } from './types.js';
import type { Launch, SpaceXData, LaunchData } from './types.js';

export async function fetchLaunches(): Promise<LaunchData> {
  const cacheKey = 'launches:all';
  const cached = await getCache<LaunchData>(cacheKey);
  if (cached) {
    return {
      upcoming: z.array(LaunchSchema).parse(cached.upcoming),
      previous: z.array(LaunchSchema).parse(cached.previous),
    };
  }

  const [upcomingRes, previousRes] = await Promise.all([
    axios.get('https://ll.thespacedevs.com/2.2.0/launch/upcoming/', {
      params: { limit: 20, format: 'json' },
      timeout: 15000,
    }),
    axios.get('https://ll.thespacedevs.com/2.2.0/launch/previous/', {
      params: { limit: 10, format: 'json' },
      timeout: 15000,
    }),
  ]);

  const result: LaunchData = {
    upcoming: z.array(LaunchSchema).parse(upcomingRes.data.results),
    previous: z.array(LaunchSchema).parse(previousRes.data.results),
  };

  await setCache(cacheKey, result, TTL.LAUNCHES);
  return result;
}

export async function fetchSpaceXData(): Promise<SpaceXData> {
  const cacheKey = 'spacex:launches';
  const cached = await getCache<SpaceXData>(cacheKey);
  if (cached) {
    return {
      pastLaunches: z.array(SpaceXLaunchSchema).parse(cached.pastLaunches),
      rockets: z.array(SpaceXRocketSchema).parse(cached.rockets),
      upcomingLaunches: z.array(SpaceXLaunchSchema).parse(cached.upcomingLaunches),
    };
  }

  const [launchesRes, rocketsRes, upcomingRes] = await Promise.all([
    axios.get('https://api.spacexdata.com/v4/launches/past', { timeout: 10000 }),
    axios.get('https://api.spacexdata.com/v4/rockets', { timeout: 10000 }),
    axios.get('https://api.spacexdata.com/v4/launches/upcoming', { timeout: 10000 }),
  ]);

  const result: SpaceXData = {
    pastLaunches: z.array(SpaceXLaunchSchema).parse(launchesRes.data.slice(-20)),
    rockets: z.array(SpaceXRocketSchema).parse(rocketsRes.data),
    upcomingLaunches: z.array(SpaceXLaunchSchema).parse(upcomingRes.data),
  };

  await setCache(cacheKey, result, TTL.LAUNCHES);
  return result;
}
