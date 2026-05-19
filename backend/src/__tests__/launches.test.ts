import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('../lib/cache.js', () => ({
  getCache: vi.fn().mockResolvedValue(null),
  setCache: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('axios');

const mockUpcomingLaunch = {
  id: 'launch-1',
  name: 'Falcon 9 | Starlink Group 6-30',
  net: '2024-06-15T12:00:00Z',
  status: { id: 1, name: 'Go for Launch', abbrev: 'Go' },
  rocket: { configuration: { name: 'Falcon 9', full_name: 'Falcon 9 Block 5' } },
  launch_service_provider: { name: 'SpaceX', country_code: 'USA' },
  mission: { name: 'Starlink Group 6-30', description: 'Starlink satellite deployment', type: 'Communications' },
  pad: { name: 'SLC-40', location: { name: 'Cape Canaveral, FL', country_code: 'USA' } },
  image: 'https://example.com/launch.jpg',
  webcast_live: false,
};

const mockPreviousLaunch = {
  id: 'launch-2',
  name: 'Atlas V | USSF-51',
  net: '2024-06-10T08:00:00Z',
  status: { id: 3, name: 'Launch Successful', abbrev: 'Success' },
  mission: null,
};

describe('fetchLaunches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and parse upcoming and previous launches', async () => {
    (axios.get as any)
      .mockResolvedValueOnce({ data: { results: [mockUpcomingLaunch] } })
      .mockResolvedValueOnce({ data: { results: [mockPreviousLaunch] } });

    const { fetchLaunches } = await import('../services/launches.js');
    const result = await fetchLaunches();

    expect(result.upcoming).toHaveLength(1);
    expect(result.previous).toHaveLength(1);
    expect(result.upcoming[0].name).toBe('Falcon 9 | Starlink Group 6-30');
    expect(result.upcoming[0].launch_service_provider?.name).toBe('SpaceX');
    expect(result.previous[0].mission).toBeNull();
  });

  it('should reject invalid launch data', async () => {
    (axios.get as any)
      .mockResolvedValueOnce({ data: { results: [{ id: 123, name: null }] } })
      .mockResolvedValueOnce({ data: { results: [] } });

    const { fetchLaunches } = await import('../services/launches.js');
    await expect(fetchLaunches()).rejects.toThrow();
  });
});

describe('fetchSpaceXData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should aggregate SpaceX launches and rockets', async () => {
    const mockPast = [
      { id: 'sx-1', name: 'FalconSat', date_utc: '2006-03-24T22:30:00.000Z', success: false },
    ];
    const mockRockets = [
      {
        id: 'r1', name: 'Falcon 9', description: 'Reusable medium-lift launch vehicle',
        stages: 2, cost_per_launch: 50000000, success_rate_pct: 98,
        first_flight: '2010-06-04',
      },
    ];
    const mockUpcoming = [
      { id: 'sx-2', name: 'Starlink 4-37', date_utc: '2025-01-01T00:00:00Z', upcoming: true },
    ];

    (axios.get as any)
      .mockResolvedValueOnce({ data: mockPast })
      .mockResolvedValueOnce({ data: mockRockets })
      .mockResolvedValueOnce({ data: mockUpcoming });

    const { fetchSpaceXData } = await import('../services/launches.js');
    const result = await fetchSpaceXData();

    expect(result.pastLaunches).toHaveLength(1);
    expect(result.rockets).toHaveLength(1);
    expect(result.upcomingLaunches).toHaveLength(1);
    expect(result.rockets[0].name).toBe('Falcon 9');
  });
});
