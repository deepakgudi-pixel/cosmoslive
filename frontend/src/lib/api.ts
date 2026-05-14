const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error ${res.status}`);
  }

  return res.json();
}

// ── Satellites ──────────────────────────────────────────
export const satelliteApi = {
  getStarlink: () => apiFetch<{ count: number; satellites: StarlinkSatellite[] }>('/api/satellites/starlink'),
};

// ── Launches ────────────────────────────────────────────
export const launchApi = {
  getUpcoming: () => apiFetch<Launch[]>('/api/launches/upcoming'),
  getPrevious: () => apiFetch<Launch[]>('/api/launches/previous'),
  getSpaceX: () => apiFetch<SpaceXData>('/api/launches/spacex'),
  getSpaceXUpcoming: () => apiFetch<SpaceXLaunch[]>('/api/launches/spacex/upcoming'),
};

// ── ISS ─────────────────────────────────────────────────
export const issApi = {
  getPosition: () => apiFetch<ISSPosition>('/api/iss/position'),
  getCrew: () => apiFetch<{ count: number; crew: CrewMember[] }>('/api/iss/crew'),
  getStream: () => apiFetch<{ url: string; source: string }>('/api/iss/stream'),
};

// ── Media ───────────────────────────────────────────────
export const mediaApi = {
  getAPOD: () => apiFetch<APOD>('/api/media/apod'),
  getAPODArchive: (count = 30) => apiFetch<APOD[]>(`/api/media/apod/archive?count=${count}`),
  getNASAImages: (q = 'nebula', page = 1) =>
    apiFetch<NASACollection>(`/api/media/nasa?q=${encodeURIComponent(q)}&page=${page}`),
};

// ── News ─────────────────────────────────────────────────
export const newsApi = {
  getArticles: (limit = 30, offset = 0, tag?: string) => {
    const tagParam = tag ? `&tag=${tag}` : '';
    return apiFetch<NewsResponse>(`/api/news?limit=${limit}&offset=${offset}${tagParam}`);
  },
  getTags: () => apiFetch<{ tags: string[] }>('/api/news/tags'),
};

// ── Types ────────────────────────────────────────────────
export interface StarlinkSatellite {
  id: string;
  name: string;
  lat: number;
  lng: number;
  height: number | null;
  velocity: number | null;
  launch: string;
}

export interface Launch {
  id: string;
  name: string;
  net: string;
  status: { id: number; name: string; abbrev: string };
  rocket: { configuration: { name: string; full_name: string } };
  launch_service_provider: { name: string; country_code: string };
  mission: { name: string; description: string; type: string } | null;
  pad: { name: string; location: { name: string; country_code: string } };
  image: string | null;
  webcast_live: boolean;
  vidURLs: { url: string }[];
}

export interface SpaceXLaunch {
  id: string;
  name: string;
  date_utc: string;
  date_precision: string;
  upcoming: boolean;
  success: boolean | null;
  links: {
    patch: { small: string | null; large: string | null };
    webcast: string | null;
    wikipedia: string | null;
  };
  rocket: string;
  launchpad: string;
  details: string | null;
  cores: { core: string | null; flight: number | null; landing_attempt: boolean | null; landing_success: boolean | null }[];
}

export interface SpaceXData {
  pastLaunches: SpaceXLaunch[];
  rockets: SpaceXRocket[];
  upcomingLaunches: SpaceXLaunch[];
}

export interface SpaceXRocket {
  id: string;
  name: string;
  description: string;
  stages: number;
  boosters: number;
  cost_per_launch: number;
  success_rate_pct: number;
  first_flight: string;
  flickr_images: string[];
}

export interface ISSPosition {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface CrewMember {
  name: string;
  craft: string;
}

export interface APOD {
  title: string;
  date: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: 'image' | 'video';
  copyright?: string;
}


export interface NASACollection {
  items: NASAItem[];
  metadata: { total_hits: number };
  links: { rel: string; href: string }[];
}

export interface NASAItem {
  data: { title: string; description: string; date_created: string; nasa_id: string }[];
  links: { href: string; rel: string }[];
}

export interface NewsArticle {
  id: number;
  title: string;
  url: string;
  image_url: string | null;
  news_site: string;
  summary: string;
  published_at: string;
  updated_at: string;
}

export interface NewsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NewsArticle[];
}
