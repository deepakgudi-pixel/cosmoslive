import axios from 'axios';
import { z } from 'zod';
import { getCache, setCache } from '../lib/cache';
import { TTL, APODSchema, NASACollectionSchema, MarsPhotoSchema } from './types';
import type { APOD } from './types';

function nasaKey(): string {
  return process.env.NASA_API_KEY || 'DEMO_KEY';
}

export async function fetchAPOD(): Promise<APOD> {
  const cacheKey = 'nasa:apod';
  const cached = await getCache(cacheKey);
  if (cached) return APODSchema.parse(cached);

  const { data } = await axios.get('https://api.nasa.gov/planetary/apod', {
    params: { api_key: nasaKey() },
    timeout: 10000,
  });

  const parsed = APODSchema.parse(data);
  await setCache(cacheKey, parsed, TTL.APOD);
  return parsed;
}

export async function fetchAPODArchive(count = 30): Promise<APOD[]> {
  const cacheKey = `nasa:apod:archive:${count}`;
  const cached = await getCache(cacheKey);
  if (cached) return z.array(APODSchema).parse(cached);

  const { data } = await axios.get('https://api.nasa.gov/planetary/apod', {
    params: { api_key: nasaKey(), count },
    timeout: 15000,
  });

  const parsed = z.array(APODSchema).parse(data);
  await setCache(cacheKey, parsed, TTL.APOD);
  return parsed;
}

export async function fetchMarsPhotos(rover = 'perseverance', sol: number | null = null) {
  let targetSol = sol;
  if (!targetSol) {
    try {
      const manifestCacheKey = `mars:manifest:${rover}`;
      let manifest: any = await getCache(manifestCacheKey);
      if (!manifest) {
        const { data: mData } = await axios.get(
          `https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}`,
          { params: { api_key: nasaKey() }, timeout: 12000 }
        );
        manifest = mData.photo_manifest;
        await setCache(manifestCacheKey, manifest, 6 * 60 * 60);
      }
      targetSol = Math.max(1, (manifest.max_sol ?? 1000) - 5);
    } catch {
      targetSol = 1000;
    }
  }

  const cacheKey = `mars:photos:${rover}:${targetSol}`;
  const cached = await getCache(cacheKey);
  if (cached) return z.array(MarsPhotoSchema).parse(cached);

  const { data } = await axios.get(
    `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos`,
    {
      params: { sol: targetSol, api_key: nasaKey(), page: 1 },
      timeout: 15000,
    }
  );

  let photos = data.photos || [];
  if (photos.length === 0) {
    for (let offset = 1; offset <= 20; offset++) {
      await new Promise((r) => setTimeout(r, 500));
      const retryRes = await axios
        .get(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos`, {
          params: { sol: targetSol - offset, api_key: nasaKey(), page: 1 },
          timeout: 12000,
        })
        .catch(() => ({ data: { photos: [] as any[] } }));
      if (retryRes.data.photos?.length > 0) {
        photos = retryRes.data.photos;
        break;
      }
    }
  }

  const result = photos.slice(0, 24);
  const validated = z.array(MarsPhotoSchema).parse(result);
  await setCache(cacheKey, validated, TTL.MARS_PHOTOS);
  return validated;
}

export async function fetchNASAImages(query = 'space', mediaType = 'image', page = 1) {
  const cacheKey = `nasa:images:${query}:${page}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get('https://images-api.nasa.gov/search', {
    params: { q: query, media_type: mediaType, page },
    timeout: 12000,
  });

  const collection = data.collection;
  await setCache(cacheKey, collection, TTL.MARS_PHOTOS);
  return NASACollectionSchema.parse(collection);
}
