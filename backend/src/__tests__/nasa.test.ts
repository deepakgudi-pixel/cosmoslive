import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('../lib/cache.js', () => ({
  getCache: vi.fn().mockResolvedValue(null),
  setCache: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('axios');

describe('fetchAPOD', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse APOD data correctly', async () => {
    (axios.get as any).mockResolvedValue({
      data: {
        title: 'Test Nebula',
        date: '2024-06-15',
        explanation: 'A beautiful nebula.',
        url: 'https://apod.nasa.gov/test.jpg',
        hdurl: 'https://apod.nasa.gov/test_hd.jpg',
        media_type: 'image',
        copyright: 'Test Author',
      },
    });

    const { fetchAPOD } = await import('../services/nasa.js');
    const result = await fetchAPOD();

    expect(result.title).toBe('Test Nebula');
    expect(result.media_type).toBe('image');
    expect(result.copyright).toBe('Test Author');
  });

  it('should reject invalid APOD data', async () => {
    (axios.get as any).mockResolvedValue({
      data: { title: 123, date: null },
    });

    const { fetchAPOD } = await import('../services/nasa.js');
    await expect(fetchAPOD()).rejects.toThrow();
  });
});

describe('fetchAPODArchive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return an array of APOD entries', async () => {
    (axios.get as any).mockResolvedValue({
      data: [
        {
          title: 'Entry 1',
          date: '2024-06-01',
          explanation: 'First.',
          url: 'https://apod.nasa.gov/1.jpg',
          media_type: 'image',
        },
        {
          title: 'Entry 2',
          date: '2024-06-02',
          explanation: 'Second.',
          url: 'https://apod.nasa.gov/2.jpg',
          media_type: 'video',
        },
      ],
    });

    const { fetchAPODArchive } = await import('../services/nasa.js');
    const result = await fetchAPODArchive(2);

    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Entry 1');
    expect(result[1].media_type).toBe('video');
  });
});

describe('fetchNASAImages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should parse NASA image collection', async () => {
    (axios.get as any).mockResolvedValue({
      data: {
        collection: {
          items: [
            {
              data: [{ title: 'Hubble Image', description: 'A galaxy far away', date_created: '2020-01-01', nasa_id: 'hub-001' }],
              links: [{ href: 'https://images.nasa.gov/thumb.jpg', rel: 'preview' }],
            },
          ],
          metadata: { total_hits: 100 },
        },
      },
    });

    const { fetchNASAImages } = await import('../services/nasa.js');
    const result = await fetchNASAImages('galaxy');

    expect(result.items).toHaveLength(1);
    expect(result.items[0].data[0].title).toBe('Hubble Image');
    expect(result.metadata?.total_hits).toBe(100);
  });
});

describe('fetchMarsPhotos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch Mars photos with a specific sol', async () => {
    (axios.get as any).mockResolvedValue({
      data: {
        photos: [
          {
            id: 1,
            sol: 100,
            img_src: 'https://mars.nasa.gov/photo1.jpg',
            earth_date: '2023-04-01',
            rover: { name: 'Perseverance', status: 'active' },
            camera: { name: 'NAVCAM', full_name: 'Navigation Camera' },
          },
        ],
      },
    });

    const { fetchMarsPhotos } = await import('../services/nasa.js');
    const result = await fetchMarsPhotos('perseverance', 100);

    expect(result).toHaveLength(1);
    expect(result[0].sol).toBe(100);
    expect(result[0].rover?.name).toBe('Perseverance');
  });

  it('should handle empty photos by retrying with earlier sols', async () => {
    // First call for manifest, then main photos call, then retries
    const getMock = (axios.get as any);
    getMock
      .mockResolvedValueOnce({ data: { photo_manifest: { max_sol: 500 } } })
      // Main photos call returns empty
      .mockResolvedValueOnce({ data: { photos: [] } });

    // Make remaining retry calls return empty too
    for (let i = 0; i < 20; i++) {
      getMock.mockResolvedValueOnce({ data: { photos: [] } });
    }

    const { fetchMarsPhotos } = await import('../services/nasa.js');

    // Use fake timers to skip the 500ms delays in the retry loop
    vi.useFakeTimers();
    const resultPromise = fetchMarsPhotos('curiosity');

    // Advance timers to skip all setTimeout delays (20 retries × 500ms)
    for (let i = 0; i < 25; i++) {
      await vi.advanceTimersByTimeAsync(600);
    }

    const result = await resultPromise;
    vi.useRealTimers();

    expect(result).toHaveLength(0);
    // Should have called manifest + main + retries
    expect(getMock).toHaveBeenCalledTimes(22); // 1 manifest + 1 main + 20 retries
  }, 15000);
});
