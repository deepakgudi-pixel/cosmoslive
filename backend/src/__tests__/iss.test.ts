import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('../lib/cache.js', () => ({
  getCache: vi.fn().mockResolvedValue(null),
  setCache: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('axios');

describe('fetchISSPosition', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse ISS position correctly', async () => {
    (axios.get as any).mockResolvedValue({
      data: {
        latitude: 51.5,
        longitude: -45.3,
        altitude: 408.0,
        velocity: 27600,
        timestamp: 1700000000,
      },
    });

    const { fetchISSPosition } = await import('../services/iss.js');
    const result = await fetchISSPosition();

    expect(result).toMatchObject({
      lat: 51.5,
      lng: -45.3,
      altitude: 408.0,
      timestamp: 1700000000,
    });
  });

  it('should reject invalid ISS position', async () => {
    (axios.get as any).mockResolvedValue({ data: { latitude: null, longitude: null, timestamp: 'bad' } });

    const { fetchISSPosition } = await import('../services/iss.js');
    await expect(fetchISSPosition()).rejects.toThrow();
  });
});

describe('fetchISSCrew', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should use fallback crew source when primary has no ISS crew', async () => {
    (axios.get as any)
      .mockResolvedValueOnce({ data: { people: [] } })
      .mockResolvedValueOnce({
        data: {
          people: [
            { name: 'Test Astronaut', craft: 'ISS' },
            { name: 'Other Station Crew', craft: 'Tiangong' },
          ],
        },
      });

    const { fetchISSCrew } = await import('../services/iss.js');
    const result = await fetchISSCrew();

    expect(result).toEqual([{ name: 'Test Astronaut', craft: 'ISS' }]);
  });
});
