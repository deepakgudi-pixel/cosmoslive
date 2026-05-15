import cron from 'node-cron';
import {
  fetchStarlinkPositions,
  fetchLaunches,
  fetchSpaceNews,
  fetchISSPosition,
  fetchISSCrew,
  fetchAPOD,
  fetchMarsPhotos,
  fetchSpaceXData,
} from '../services/index.js';

const WARM_CACHE_JOBS = {
  'iss-position': () => fetchISSPosition(),
  starlink: () => fetchStarlinkPositions(),
  launches: async () => {
    await fetchLaunches();
    await fetchSpaceXData();
  },
  news: () => fetchSpaceNews(),
  apod: () => fetchAPOD(),
  'mars-crew': async () => {
    await fetchMarsPhotos();
    await fetchISSCrew();
  },
} as const;

export type WarmCacheJobName = keyof typeof WARM_CACHE_JOBS;

function safe(fn: () => Promise<unknown>, label: string) {
  fn().catch((e) => console.error(`[cron] ${label} failed:`, (e as Error).message));
}

export function isWarmCacheJobName(jobName: string): jobName is WarmCacheJobName {
  return jobName in WARM_CACHE_JOBS;
}

export async function runWarmCacheJob(jobName: WarmCacheJobName) {
  await WARM_CACHE_JOBS[jobName]();
}

export function startCronJobs() {
  cron.schedule('*/8 * * * * *', () => safe(() => runWarmCacheJob('iss-position'), 'ISS position'));
  cron.schedule('*/25 * * * * *', () => safe(() => runWarmCacheJob('starlink'), 'Starlink'));
  cron.schedule('*/4 * * * *', () => safe(() => runWarmCacheJob('launches'), 'Launches'));
  cron.schedule('*/9 * * * *', () => safe(() => runWarmCacheJob('news'), 'News'));
  cron.schedule('0 * * * *', () => safe(() => runWarmCacheJob('apod'), 'APOD'));
  cron.schedule('0 */6 * * *', () => safe(() => runWarmCacheJob('mars-crew'), 'Mars/Crew'));

  console.log('Background cron jobs started');
}
