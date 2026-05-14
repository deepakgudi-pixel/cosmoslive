const axios = require('axios');
const { getCache, setCache } = require('../lib/cache');

// TTL constants (seconds)
const TTL = {
  SATELLITE_POSITIONS: 30,
  ISS_POSITION: 10,
  LAUNCHES: 5 * 60,
  NEWS: 10 * 60,
  APOD: 24 * 60 * 60,
  MARS_PHOTOS: 60 * 60,
  ASTRONAUTS: 6 * 60 * 60,
  SPACEX_ROCKETS: 60 * 60,
  STARLINK: 30,
};

/**
 * Fetch Starlink satellite positions from SpaceX API
 */
async function fetchStarlinkPositions() {
  const cacheKey = 'starlink:positions';
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get('https://api.spacexdata.com/v4/starlink', {
    timeout: 10000,
  });

  // Filter to only satellites with valid latitude/longitude
  const positions = data
    .filter((s) => s.latitude != null && s.longitude != null)
    .map((s) => ({
      id: s.id,
      name: s.spaceTrack?.OBJECT_NAME || 'STARLINK',
      lat: s.latitude,
      lng: s.longitude,
      height: s.height_km,
      velocity: s.velocity_kms,
      launch: s.launch,
    }));

  await setCache(cacheKey, positions, TTL.STARLINK);
  return positions;
}

/**
 * Fetch upcoming and past launches from Launch Library 2
 */
async function fetchLaunches() {
  const cacheKey = 'launches:upcoming';
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const [upcoming, previous] = await Promise.all([
    axios.get('https://ll.thespacedevs.com/2.2.0/launch/upcoming/', {
      params: { limit: 20, format: 'json' },
      timeout: 15000,
    }),
    axios.get('https://ll.thespacedevs.com/2.2.0/launch/previous/', {
      params: { limit: 10, format: 'json' },
      timeout: 15000,
    }),
  ]);

  const result = {
    upcoming: upcoming.data.results,
    previous: previous.data.results,
  };

  await setCache(cacheKey, result, TTL.LAUNCHES);
  return result;
}

/**
 * Fetch SpaceX specific launches and rocket data
 */
async function fetchSpaceXData() {
  const cacheKey = 'spacex:launches';
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const [launches, rockets, upcoming] = await Promise.all([
    axios.get('https://api.spacexdata.com/v4/launches/past', { timeout: 10000 }),
    axios.get('https://api.spacexdata.com/v4/rockets', { timeout: 10000 }),
    axios.get('https://api.spacexdata.com/v4/launches/upcoming', { timeout: 10000 }),
  ]);

  const result = {
    pastLaunches: launches.data.slice(-20),
    rockets: rockets.data,
    upcomingLaunches: upcoming.data,
  };

  await setCache(cacheKey, result, TTL.LAUNCHES);
  return result;
}

/**
 * Fetch ISS position — uses wheretheiss.at (HTTPS, reliable)
 */
async function fetchISSPosition() {
  const cacheKey = 'iss:position';
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get('https://api.wheretheiss.at/v1/satellites/25544', {
    timeout: 10000,
  });

  const result = {
    lat: data.latitude,
    lng: data.longitude,
    altitude: data.altitude,
    velocity: data.velocity,
    timestamp: Math.floor(data.timestamp),
  };

  await setCache(cacheKey, result, TTL.ISS_POSITION);
  return result;
}

/**
 * Fetch ISS crew — Open Notify HTTPS fallback
 */
async function fetchISSCrew() {
  const cacheKey = 'iss:crew';
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  // Try HTTPS endpoint first
  const { data } = await axios.get('https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json', {
    timeout: 10000,
  });

  const crew = (data.people || []).filter((p) => p.craft === 'ISS');
  await setCache(cacheKey, crew, TTL.ASTRONAUTS);
  return crew;
}

/**
 * Fetch NASA APOD
 */
async function fetchAPOD() {
  const cacheKey = 'nasa:apod';
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get('https://api.nasa.gov/planetary/apod', {
    params: { api_key: process.env.NASA_API_KEY || 'DEMO_KEY' },
    timeout: 10000,
  });

  await setCache(cacheKey, data, TTL.APOD);
  return data;
}

/**
 * Fetch NASA APOD archive (last 30 days)
 */
async function fetchAPODArchive(count = 30) {
  const cacheKey = `nasa:apod:archive:${count}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get('https://api.nasa.gov/planetary/apod', {
    params: {
      api_key: process.env.NASA_API_KEY || 'DEMO_KEY',
      count,
    },
    timeout: 15000,
  });

  await setCache(cacheKey, data, TTL.MARS_PHOTOS);
  return data;
}

/**
 * Fetch Mars rover photos — uses latest available sol automatically
 */
async function fetchMarsPhotos(rover = 'perseverance', sol = null) {
  // If no sol given, fetch rover manifest to get max_sol
  let targetSol = sol;
  if (!targetSol) {
    try {
      const manifestCacheKey = `mars:manifest:${rover}`;
      let manifest = await getCache(manifestCacheKey);
      if (!manifest) {
        const { data: mData } = await axios.get(
          `https://api.nasa.gov/mars-photos/api/v1/manifests/${rover}`,
          { params: { api_key: process.env.NASA_API_KEY || 'DEMO_KEY' }, timeout: 12000 }
        );
        manifest = mData.photo_manifest;
        await setCache(manifestCacheKey, manifest, 6 * 60 * 60); // 6h
      }
      // Use a sol a bit behind max to ensure photos exist
      targetSol = Math.max(1, (manifest.max_sol || 1000) - 5);
    } catch (_) {
      targetSol = 1000;
    }
  }

  const cacheKey = `mars:photos:${rover}:${targetSol}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get(
    `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos`,
    {
      params: {
        sol: targetSol,
        api_key: process.env.NASA_API_KEY || 'DEMO_KEY',
        page: 1,
      },
      timeout: 15000,
    }
  );

  // If sol has no photos, try a few earlier sols
  let photos = data.photos || [];
  if (photos.length === 0) {
    for (let offset = 1; offset <= 20; offset++) {
      const { data: retry } = await axios.get(
        `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos`,
        {
          params: { sol: targetSol - offset, api_key: process.env.NASA_API_KEY || 'DEMO_KEY', page: 1 },
          timeout: 12000,
        }
      ).catch(() => ({ data: { photos: [] } }));
      if (retry.photos?.length > 0) { photos = retry.photos; break; }
    }
  }

  const result = photos.slice(0, 24);
  await setCache(cacheKey, result, TTL.MARS_PHOTOS);
  return result;
}

/**
 * Fetch space news from Spaceflight News API
 */
async function fetchSpaceNews(limit = 30, offset = 0) {
  const cacheKey = `news:${limit}:${offset}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get('https://api.spaceflightnewsapi.net/v4/articles/', {
    params: { limit, offset, ordering: '-published_at' },
    timeout: 12000,
  });

  await setCache(cacheKey, data, TTL.NEWS);
  return data;
}

/**
 * Fetch NASA image search
 */
async function fetchNASAImages(query = 'space', mediaType = 'image', page = 1) {
  const cacheKey = `nasa:images:${query}:${page}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get('https://images-api.nasa.gov/search', {
    params: { q: query, media_type: mediaType, page },
    timeout: 12000,
  });

  await setCache(cacheKey, data.collection, TTL.MARS_PHOTOS);
  return data.collection;
}

module.exports = {
  fetchStarlinkPositions,
  fetchLaunches,
  fetchSpaceXData,
  fetchISSPosition,
  fetchISSCrew,
  fetchAPOD,
  fetchAPODArchive,
  fetchMarsPhotos,
  fetchSpaceNews,
  fetchNASAImages,
  TTL,
};
