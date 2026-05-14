const cron = require('node-cron');
const {
  fetchStarlinkPositions,
  fetchLaunches,
  fetchSpaceNews,
  fetchISSPosition,
  fetchISSCrew,
  fetchAPOD,
  fetchMarsPhotos,
  fetchSpaceXData,
} = require('../services/apiService');

function startCronJobs() {
  // ── ISS position — every 8 seconds
  cron.schedule('*/8 * * * * *', async () => {
    try {
      await fetchISSPosition();
    } catch (e) {
      console.error('[cron] ISS position failed:', e.message);
    }
  });

  // ── Starlink positions — every 25 seconds
  cron.schedule('*/25 * * * * *', async () => {
    try {
      await fetchStarlinkPositions();
    } catch (e) {
      console.error('[cron] Starlink failed:', e.message);
    }
  });

  // ── Launch data — every 4 minutes
  cron.schedule('*/4 * * * *', async () => {
    try {
      await fetchLaunches();
      await fetchSpaceXData();
    } catch (e) {
      console.error('[cron] Launches failed:', e.message);
    }
  });

  // ── Space news — every 9 minutes
  cron.schedule('*/9 * * * *', async () => {
    try {
      await fetchSpaceNews();
    } catch (e) {
      console.error('[cron] News failed:', e.message);
    }
  });

  // ── APOD — once per hour (NASA updates it daily, but we prime the cache)
  cron.schedule('0 * * * *', async () => {
    try {
      await fetchAPOD();
    } catch (e) {
      console.error('[cron] APOD failed:', e.message);
    }
  });

  // ── Mars photos + crew — every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    try {
      await fetchMarsPhotos();
      await fetchISSCrew();
    } catch (e) {
      console.error('[cron] Mars/Crew failed:', e.message);
    }
  });

  console.log('⏱  Background cron jobs started');
}

module.exports = { startCronJobs };
