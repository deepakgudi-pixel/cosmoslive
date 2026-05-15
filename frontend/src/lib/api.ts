import { z } from 'zod';

function getApiBase() {
  if (typeof window !== 'undefined') {
    // Browser requests should stay same-origin so Next.js can proxy them.
    return '';
  }

  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);

  // Avoid forcing JSON headers onto GET requests, which triggers unnecessary preflights.
  if (options?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${getApiBase()}${path}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || `API error ${res.status}`);
    }

    return res.json();
  } catch (err: unknown) {
    console.error(`Fetch failed for ${url}:`, err);
    throw err;
  }
}

// ── Zod Schemas ──────────────────────────────────────────

const StarlinkSatelliteSchema = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  height: z.number().nullable(),
  velocity: z.number().nullable(),
  launch: z.string().nullable().optional(),
});

const StarlinkResponseSchema = z.object({
  count: z.number(),
  satellites: z.array(StarlinkSatelliteSchema),
});

const LaunchStatusSchema = z.object({
  id: z.number(),
  name: z.string(),
  abbrev: z.string(),
});

export const LaunchSchema = z.object({
  id: z.string(),
  name: z.string(),
  net: z.string(),
  status: LaunchStatusSchema,
  rocket: z.object({ configuration: z.object({ name: z.string(), full_name: z.string().optional() }) }).optional(),
  launch_service_provider: z.object({ name: z.string(), country_code: z.string().optional() }).optional(),
  mission: z.object({ name: z.string().optional(), description: z.string().optional(), type: z.string().optional() }).nullable(),
  pad: z.object({ name: z.string().optional(), location: z.object({ name: z.string(), country_code: z.string().optional() }).optional() }).optional(),
  image: z.string().nullable().optional(),
  webcast_live: z.boolean().optional(),
  vidURLs: z.array(z.object({ url: z.string() })).optional(),
});

const SpaceXLaunchSchema = z.object({
  id: z.string(),
  name: z.string(),
  date_utc: z.string(),
  date_precision: z.string().optional(),
  upcoming: z.boolean().optional(),
  success: z.boolean().nullable().optional(),
  links: z.object({
    patch: z.object({ small: z.string().nullable(), large: z.string().nullable() }).optional(),
    webcast: z.string().nullable().optional(),
    wikipedia: z.string().nullable().optional(),
  }).optional(),
  rocket: z.string().optional(),
  launchpad: z.string().optional(),
  details: z.string().nullable().optional(),
  cores: z.array(z.object({
    core: z.string().nullable(),
    flight: z.number().nullable(),
    landing_attempt: z.boolean().nullable(),
    landing_success: z.boolean().nullable(),
  })).optional(),
});

const SpaceXRocketSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  stages: z.number(),
  boosters: z.number().optional(),
  cost_per_launch: z.number(),
  success_rate_pct: z.number(),
  first_flight: z.string(),
  flickr_images: z.array(z.string()).optional(),
});

const SpaceXDataSchema = z.object({
  pastLaunches: z.array(SpaceXLaunchSchema),
  rockets: z.array(SpaceXRocketSchema),
  upcomingLaunches: z.array(SpaceXLaunchSchema),
});

const ISSPositionSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  timestamp: z.number(),
});

const CrewMemberSchema = z.object({
  name: z.string(),
  craft: z.string(),
});

const CrewResponseSchema = z.object({
  count: z.number(),
  crew: z.array(CrewMemberSchema),
});

const StreamResponseSchema = z.object({
  url: z.string(),
  source: z.string(),
});

const APODSchema = z.object({
  title: z.string(),
  date: z.string(),
  explanation: z.string(),
  url: z.string(),
  hdurl: z.string().optional(),
  media_type: z.enum(['image', 'video']),
  copyright: z.string().optional(),
});

const NASAItemDataSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date_created: z.string(),
  nasa_id: z.string(),
});

const NASAItemLinkSchema = z.object({
  href: z.string(),
  rel: z.string().optional(),
});

const NASAItemSchema = z.object({
  data: z.array(NASAItemDataSchema),
  links: z.array(NASAItemLinkSchema).optional(),
});

const NASAMetadataSchema = z.object({
  total_hits: z.number(),
});

const NASALinkSchema = z.object({
  rel: z.string(),
  href: z.string(),
});

const NASACollectionSchema = z.object({
  items: z.array(NASAItemSchema),
  metadata: NASAMetadataSchema.optional(),
  links: z.array(NASALinkSchema).optional(),
});

const NewsArticleSchema = z.object({
  id: z.number(),
  title: z.string(),
  url: z.string(),
  image_url: z.string().nullable().optional(),
  news_site: z.string(),
  summary: z.string().optional(),
  published_at: z.string(),
  updated_at: z.string().optional(),
});

const NewsResponseSchema = z.object({
  count: z.number().optional(),
  next: z.string().nullable().optional(),
  previous: z.string().nullable().optional(),
  results: z.array(NewsArticleSchema),
});

const MetadataSchema = z.record(z.string(), z.unknown());

const BookmarkSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  type: z.enum(['image', 'news', 'satellite', 'launch', 'article']),
  referenceId: z.string(),
  metadata: MetadataSchema.default({}),
  savedAt: z.string(),
});

const AlertSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  alertType: z.enum(['launch', 'satellite_pass', 'iss_pass']),
  config: MetadataSchema.default({}),
  active: z.boolean(),
  createdAt: z.string(),
});

const UserSyncResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    clerkId: z.string(),
    email: z.string(),
    createdAt: z.string(),
  }),
});

const BookmarkResponseSchema = z.object({ bookmark: BookmarkSchema, existing: z.boolean().optional() });
const BookmarksResponseSchema = z.object({ bookmarks: z.array(BookmarkSchema) });
const AlertResponseSchema = z.object({ alert: AlertSchema, existing: z.boolean().optional() });
const AlertsResponseSchema = z.object({ alerts: z.array(AlertSchema) });

// ── Inferred Types ───────────────────────────────────────

export type StarlinkSatellite = z.infer<typeof StarlinkSatelliteSchema>;
export type Launch = z.infer<typeof LaunchSchema>;
export type SpaceXLaunch = z.infer<typeof SpaceXLaunchSchema>;
export type SpaceXRocket = z.infer<typeof SpaceXRocketSchema>;
export interface SpaceXData { pastLaunches: SpaceXLaunch[]; rockets: SpaceXRocket[]; upcomingLaunches: SpaceXLaunch[]; }
export type ISSPosition = z.infer<typeof ISSPositionSchema>;
export type CrewMember = z.infer<typeof CrewMemberSchema>;
export type APOD = z.infer<typeof APODSchema>;
export type NASACollection = z.infer<typeof NASACollectionSchema>;
export type NewsArticle = z.infer<typeof NewsArticleSchema>;
export interface NewsResponse { count?: number; next?: string | null; previous?: string | null; results: NewsArticle[]; }
export type Bookmark = z.infer<typeof BookmarkSchema>;
export type Alert = z.infer<typeof AlertSchema>;
export type BookmarkType = Bookmark['type'];
export type AlertType = Alert['alertType'];

export interface CreateBookmarkInput {
  type: BookmarkType;
  referenceId: string;
  metadata?: Record<string, unknown>;
}

export interface CreateAlertInput {
  alertType: AlertType;
  config?: Record<string, unknown>;
}

// ── API Functions ────────────────────────────────────────

export const satelliteApi = {
  getStarlink: () =>
    apiFetch<z.infer<typeof StarlinkResponseSchema>>('/api/satellites/starlink')
      .then((d) => StarlinkResponseSchema.parse(d)),
};

export const launchApi = {
  getUpcoming: () =>
    apiFetch<Launch[]>('/api/launches/upcoming')
      .then((d) => z.array(LaunchSchema).parse(d)),
  getPrevious: () =>
    apiFetch<Launch[]>('/api/launches/previous')
      .then((d) => z.array(LaunchSchema).parse(d)),
  getSpaceX: () =>
    apiFetch<SpaceXData>('/api/launches/spacex')
      .then((d) => SpaceXDataSchema.parse(d)),
  getSpaceXUpcoming: () =>
    apiFetch<SpaceXLaunch[]>('/api/launches/spacex/upcoming')
      .then((d) => z.array(SpaceXLaunchSchema).parse(d)),
};

export const issApi = {
  getPosition: () =>
    apiFetch<ISSPosition>('/api/iss/position')
      .then((d) => ISSPositionSchema.parse(d)),
  getCrew: () =>
    apiFetch<unknown>('/api/iss/crew')
      .then((d) => CrewResponseSchema.parse(d)),
  getStream: () =>
    apiFetch<unknown>('/api/iss/stream')
      .then((d) => StreamResponseSchema.parse(d)),
};

export const mediaApi = {
  getAPOD: () =>
    apiFetch<APOD>('/api/media/apod')
      .then((d) => APODSchema.parse(d)),
  getAPODArchive: (count = 30) =>
    apiFetch<APOD[]>(`/api/media/apod/archive?count=${count}`)
      .then((d) => z.array(APODSchema).parse(d)),
  getNASAImages: (q = 'nebula', page = 1) =>
    apiFetch<NASACollection>(`/api/media/nasa?q=${encodeURIComponent(q)}&page=${page}`)
      .then((d) => NASACollectionSchema.parse(d)),
};

export const newsApi = {
  getArticles: (limit = 30, offset = 0, tag?: string) => {
    const tagParam = tag ? `&tag=${tag}` : '';
    return apiFetch<NewsResponse>(`/api/news?limit=${limit}&offset=${offset}${tagParam}`)
      .then((d) => NewsResponseSchema.parse(d));
  },
  getTags: () => apiFetch<{ tags: string[] }>('/api/news/tags'),
};

export const userApi = {
  sync: (clerkId: string, email: string) =>
    apiFetch<z.infer<typeof UserSyncResponseSchema>>('/api/users/sync', {
      method: 'POST',
      body: JSON.stringify({ clerk_id: clerkId, email }),
    }).then((d) => UserSyncResponseSchema.parse(d)),
  getBookmarks: (clerkId: string) =>
    apiFetch<z.infer<typeof BookmarksResponseSchema>>(`/api/users/${clerkId}/bookmarks`)
      .then((d) => BookmarksResponseSchema.parse(d)),
  createBookmark: (clerkId: string, input: CreateBookmarkInput) =>
    apiFetch<z.infer<typeof BookmarkResponseSchema>>(`/api/users/${clerkId}/bookmarks`, {
      method: 'POST',
      body: JSON.stringify(input),
    }).then((d) => BookmarkResponseSchema.parse(d)),
  deleteBookmark: (clerkId: string, bookmarkId: string) =>
    apiFetch<{ success: boolean }>(`/api/users/${clerkId}/bookmarks/${bookmarkId}`, {
      method: 'DELETE',
    }),
  getAlerts: (clerkId: string) =>
    apiFetch<z.infer<typeof AlertsResponseSchema>>(`/api/users/${clerkId}/alerts`)
      .then((d) => AlertsResponseSchema.parse(d)),
  createAlert: (clerkId: string, input: CreateAlertInput) =>
    apiFetch<z.infer<typeof AlertResponseSchema>>(`/api/users/${clerkId}/alerts`, {
      method: 'POST',
      body: JSON.stringify(input),
    }).then((d) => AlertResponseSchema.parse(d)),
  deleteAlert: (clerkId: string, alertId: string) =>
    apiFetch<{ success: boolean }>(`/api/users/${clerkId}/alerts/${alertId}`, {
      method: 'DELETE',
    }),
};
