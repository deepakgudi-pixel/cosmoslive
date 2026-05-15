import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('../lib/cache.js', () => ({
  getCache: vi.fn().mockResolvedValue(null),
  setCache: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('axios');

const mockStarlinkData = [
  {
    id: 'sat-1',
    spaceTrack: { OBJECT_NAME: 'STARLINK-100' },
    latitude: 45.0,
    longitude: -120.0,
    height_km: 550,
    velocity_kms: 7.5,
    launch: '2024-01-01',
  },
  {
    id: 'sat-2',
    spaceTrack: { OBJECT_NAME: 'STARLINK-200' },
    latitude: null,
    longitude: null,
    height_km: null,
    velocity_kms: null,
  },
];

describe('fetchStarlinkPositions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and filter starlink positions', async () => {
    (axios.get as any).mockResolvedValue({ data: mockStarlinkData });

    const { fetchStarlinkPositions } = await import('../services/starlink.js');
    const result = await fetchStarlinkPositions();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'sat-1',
      name: 'STARLINK-100',
      lat: 45.0,
      lng: -120.0,
      height: 550,
      velocity: 7.5,
    });
  });

  it('should reject invalid response data', async () => {
    (axios.get as any).mockResolvedValue({ data: [{ id: 'bad', latitude: 'not-a-number', longitude: null }] });

    const { fetchStarlinkPositions } = await import('../services/starlink.js');
    await expect(fetchStarlinkPositions()).rejects.toThrow();
  });
});
