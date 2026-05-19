import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/index.js', () => ({
  fetchISSPosition: vi.fn().mockResolvedValue({ lat: 0, lng: 0, timestamp: 1 }),
  fetchStarlinkPositions: vi.fn().mockResolvedValue([]),
  fetchLaunches: vi.fn().mockResolvedValue({ upcoming: [], previous: [] }),
  fetchSpaceXData: vi.fn().mockResolvedValue({ pastLaunches: [], rockets: [], upcomingLaunches: [] }),
  fetchSpaceNews: vi.fn().mockResolvedValue({ results: [] }),
  fetchAPOD: vi.fn().mockResolvedValue({ title: 'Test', date: '2024-01-01', explanation: 'test', url: 'https://test', media_type: 'image' }),
  fetchMarsPhotos: vi.fn().mockResolvedValue([]),
  fetchISSCrew: vi.fn().mockResolvedValue([]),
}));

describe('Cron jobs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should identify valid warm cache job names', async () => {
    const { isWarmCacheJobName } = await import('../jobs/cron.js');

    expect(isWarmCacheJobName('iss-position')).toBe(true);
    expect(isWarmCacheJobName('starlink')).toBe(true);
    expect(isWarmCacheJobName('launches')).toBe(true);
    expect(isWarmCacheJobName('news')).toBe(true);
    expect(isWarmCacheJobName('apod')).toBe(true);
    expect(isWarmCacheJobName('mars-crew')).toBe(true);
    expect(isWarmCacheJobName('invalid-job')).toBe(false);
    expect(isWarmCacheJobName('')).toBe(false);
  });

  it('should run iss-position warm cache job', async () => {
    const { runWarmCacheJob } = await import('../jobs/cron.js');
    const services = await import('../services/index.js');

    await runWarmCacheJob('iss-position');
    expect(services.fetchISSPosition).toHaveBeenCalledOnce();
  });

  it('should run starlink warm cache job', async () => {
    const { runWarmCacheJob } = await import('../jobs/cron.js');
    const services = await import('../services/index.js');

    await runWarmCacheJob('starlink');
    expect(services.fetchStarlinkPositions).toHaveBeenCalledOnce();
  });

  it('should run launches warm cache job (fetches both launches and SpaceX)', async () => {
    const { runWarmCacheJob } = await import('../jobs/cron.js');
    const services = await import('../services/index.js');

    await runWarmCacheJob('launches');
    expect(services.fetchLaunches).toHaveBeenCalledOnce();
    expect(services.fetchSpaceXData).toHaveBeenCalledOnce();
  });

  it('should run mars-crew warm cache job (fetches both Mars photos and crew)', async () => {
    const { runWarmCacheJob } = await import('../jobs/cron.js');
    const services = await import('../services/index.js');

    await runWarmCacheJob('mars-crew');
    expect(services.fetchMarsPhotos).toHaveBeenCalledOnce();
    expect(services.fetchISSCrew).toHaveBeenCalledOnce();
  });

  it('should run news warm cache job', async () => {
    const { runWarmCacheJob } = await import('../jobs/cron.js');
    const services = await import('../services/index.js');

    await runWarmCacheJob('news');
    expect(services.fetchSpaceNews).toHaveBeenCalledOnce();
  });

  it('should run apod warm cache job', async () => {
    const { runWarmCacheJob } = await import('../jobs/cron.js');
    const services = await import('../services/index.js');

    await runWarmCacheJob('apod');
    expect(services.fetchAPOD).toHaveBeenCalledOnce();
  });
});
