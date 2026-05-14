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
} from '../services';

function safe(fn: () => Promise<any>, label: string) {
  fn().catch((e) => console.error(`[cron] ${label} failed:`, (e as Error).message));
}

export function startCronJobs() {
  cron.schedule('*/8 * * * * *', () => safe(fetchISSPosition, 'ISS position'));
  cron.schedule('*/25 * * * * *', () => safe(fetchStarlinkPositions, 'Starlink'));
  cron.schedule('*/4 * * * *', () => safe(async () => { await fetchLaunches(); await fetchSpaceXData(); }, 'Launches'));
  cron.schedule('*/9 * * * *', () => safe(() => fetchSpaceNews(), 'News'));
  cron.schedule('0 * * * *', () => safe(fetchAPOD, 'APOD'));
  cron.schedule('0 */6 * * *', () => safe(async () => { await fetchMarsPhotos(); await fetchISSCrew(); }, 'Mars/Crew'));

  console.log('Background cron jobs started');
}
