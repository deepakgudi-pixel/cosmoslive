import { z } from 'zod';

export const TTL = {
  SATELLITE_POSITIONS: 30,
  ISS_POSITION: 10,
  LAUNCHES: 5 * 60,
  NEWS: 10 * 60,
  APOD: 24 * 60 * 60,
  MARS_PHOTOS: 60 * 60,
  ASTRONAUTS: 6 * 60 * 60,
  SPACEX_ROCKETS: 60 * 60,
  STARLINK: 30,
} as const;

// ── Starlink ──────────────────────────────────────────────

export const StarlinkPositionSchema = z.object({
  id: z.string(),
  name: z.string(),
  lat: z.number(),
  lng: z.number(),
  height: z.number().nullable(),
  velocity: z.number().nullable(),
  launch: z.string().nullable().optional(),
});

export type StarlinkPosition = z.infer<typeof StarlinkPositionSchema>;

// ── ISS ───────────────────────────────────────────────────

export const ISSPositionSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  altitude: z.number().optional(),
  velocity: z.number().optional(),
  timestamp: z.number(),
});

export type ISSPosition = z.infer<typeof ISSPositionSchema>;

const RawISSCrewItem = z.object({
  name: z.string(),
  craft: z.string(),
});

export const ISSCrewResponseSchema = z.object({
  people: z.array(RawISSCrewItem).optional(),
});

export const CrewMemberSchema = z.object({
  name: z.string(),
  craft: z.string(),
});

export type CrewMember = z.infer<typeof CrewMemberSchema>;

// ── Launches (Launch Library 2) ───────────────────────────

const LaunchStatusSchema = z.object({
  id: z.number(),
  name: z.string(),
  abbrev: z.string(),
});

const RocketConfigSchema = z.object({
  name: z.string(),
  full_name: z.string().optional(),
});

const RocketSchema = z.object({
  configuration: RocketConfigSchema,
});

const ServiceProviderSchema = z.object({
  name: z.string(),
  country_code: z.string().optional(),
});

const MissionSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
}).nullable();

const PadLocationSchema = z.object({
  name: z.string(),
  country_code: z.string().optional(),
});

const PadSchema = z.object({
  name: z.string().optional(),
  location: PadLocationSchema.optional(),
});

const VidURLSchema = z.object({
  url: z.string(),
});

export const LaunchSchema = z.object({
  id: z.string(),
  name: z.string(),
  net: z.string(),
  status: LaunchStatusSchema,
  rocket: RocketSchema.optional(),
  launch_service_provider: ServiceProviderSchema.optional(),
  mission: MissionSchema,
  pad: PadSchema.optional(),
  image: z.string().nullable().optional(),
  webcast_live: z.boolean().optional(),
  vidURLs: z.array(VidURLSchema).optional(),
});

export type Launch = z.infer<typeof LaunchSchema>;

// ── SpaceX ────────────────────────────────────────────────

const SpaceXLaunchLinksSchema = z.object({
  patch: z.object({
    small: z.string().nullable(),
    large: z.string().nullable(),
  }).optional(),
  webcast: z.string().nullable().optional(),
  wikipedia: z.string().nullable().optional(),
});

const SpaceXCoreSchema = z.object({
  core: z.string().nullable(),
  flight: z.number().nullable(),
  landing_attempt: z.boolean().nullable(),
  landing_success: z.boolean().nullable(),
});

export const SpaceXLaunchSchema = z.object({
  id: z.string(),
  name: z.string(),
  date_utc: z.string(),
  date_precision: z.string().optional(),
  upcoming: z.boolean().optional(),
  success: z.boolean().nullable().optional(),
  links: SpaceXLaunchLinksSchema.optional(),
  rocket: z.string().optional(),
  launchpad: z.string().optional(),
  details: z.string().nullable().optional(),
  cores: z.array(SpaceXCoreSchema).optional(),
});

export type SpaceXLaunch = z.infer<typeof SpaceXLaunchSchema>;

export const SpaceXRocketSchema = z.object({
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

export type SpaceXRocket = z.infer<typeof SpaceXRocketSchema>;

// ── NASA APOD ─────────────────────────────────────────────

export const APODSchema = z.object({
  title: z.string(),
  date: z.string(),
  explanation: z.string(),
  url: z.string(),
  hdurl: z.string().optional(),
  media_type: z.enum(['image', 'video']),
  copyright: z.string().optional(),
});

export type APOD = z.infer<typeof APODSchema>;

// ── NASA Images ───────────────────────────────────────────

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

export const NASACollectionSchema = z.object({
  items: z.array(NASAItemSchema),
  metadata: NASAMetadataSchema.optional(),
  links: z.array(NASALinkSchema).optional(),
});

// ── News ──────────────────────────────────────────────────

export const NewsArticleSchema = z.object({
  id: z.number(),
  title: z.string(),
  url: z.string(),
  image_url: z.string().nullable().optional(),
  news_site: z.string(),
  summary: z.string().optional(),
  published_at: z.string(),
  updated_at: z.string().optional(),
});

export type NewsArticle = z.infer<typeof NewsArticleSchema>;

export const NewsResponseSchema = z.object({
  count: z.number().optional(),
  next: z.string().nullable().optional(),
  previous: z.string().nullable().optional(),
  results: z.array(NewsArticleSchema),
});

// ── Weather & Cache ───────────────────────────────────────

export const MarsPhotoSchema = z.object({
  id: z.number(),
  sol: z.number(),
  img_src: z.string(),
  earth_date: z.string(),
  rover: z.object({
    name: z.string(),
    status: z.string().optional(),
  }).optional(),
  camera: z.object({
    name: z.string(),
    full_name: z.string(),
  }).optional(),
});

export interface SpaceXData {
  pastLaunches: SpaceXLaunch[];
  rockets: SpaceXRocket[];
  upcomingLaunches: SpaceXLaunch[];
}

export interface LaunchData {
  upcoming: Launch[];
  previous: Launch[];
}
