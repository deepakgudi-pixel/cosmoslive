import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

vi.mock('../lib/cache.js', () => ({
  getCache: vi.fn().mockResolvedValue(null),
  setCache: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('axios');

const mockNewsResponse = {
  count: 100,
  next: 'https://api.spaceflightnewsapi.net/v4/articles/?limit=30&offset=30',
  previous: null,
  results: [
    {
      id: 1,
      title: 'SpaceX Launches Starlink Batch',
      url: 'https://example.com/spacex-starlink',
      image_url: 'https://example.com/image.jpg',
      news_site: 'SpaceNews',
      summary: 'SpaceX successfully launched another batch of Starlink satellites.',
      published_at: '2024-06-15T12:00:00Z',
      updated_at: '2024-06-15T13:00:00Z',
    },
    {
      id: 2,
      title: 'NASA Artemis Update',
      url: 'https://example.com/artemis',
      image_url: null,
      news_site: 'NASA Spaceflight',
      summary: 'NASA provides an update on the Artemis program and Moon missions.',
      published_at: '2024-06-14T10:00:00Z',
    },
    {
      id: 3,
      title: 'ISS Crew Rotation Complete',
      url: 'https://example.com/iss-crew',
      news_site: 'Space.com',
      summary: 'The ISS crew rotation has been completed with the arrival of Crew Dragon.',
      published_at: '2024-06-13T08:00:00Z',
    },
  ],
};

describe('fetchSpaceNews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and parse space news articles', async () => {
    (axios.get as any).mockResolvedValue({ data: mockNewsResponse });

    const { fetchSpaceNews } = await import('../services/news.js');
    const result = await fetchSpaceNews(30, 0);

    expect(result.results).toHaveLength(3);
    expect(result.count).toBe(100);
    expect(result.results[0].title).toBe('SpaceX Launches Starlink Batch');
    expect(result.results[1].image_url).toBeNull();
  });
});

describe('fetchFilteredNews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should filter news by tag', async () => {
    (axios.get as any).mockResolvedValue({ data: mockNewsResponse });

    const { fetchFilteredNews } = await import('../services/news.js');
    const result = await fetchFilteredNews(30, 0, 'SpaceX');

    // Should match articles with "SpaceX" in title or summary
    expect(result.results.length).toBeGreaterThanOrEqual(1);
    expect(result.results.every((a) =>
      a.title.toLowerCase().includes('spacex') ||
      a.summary?.toLowerCase().includes('spacex') ||
      a.news_site.toLowerCase().includes('spacex')
    )).toBe(true);
  });

  it('should return all news when no tag is provided', async () => {
    (axios.get as any).mockResolvedValue({ data: mockNewsResponse });

    const { fetchFilteredNews } = await import('../services/news.js');
    const result = await fetchFilteredNews(30, 0);

    expect(result.results).toHaveLength(3);
  });

  it('should ignore invalid tags', async () => {
    (axios.get as any).mockResolvedValue({ data: mockNewsResponse });

    const { fetchFilteredNews } = await import('../services/news.js');
    const result = await fetchFilteredNews(30, 0, 'InvalidTag');

    // Invalid tag should return unfiltered results
    expect(result.results).toHaveLength(3);
  });
});

describe('VALID_NEWS_TAGS', () => {
  it('should export a list of valid tags', async () => {
    const { VALID_NEWS_TAGS } = await import('../services/news.js');
    expect(Array.isArray(VALID_NEWS_TAGS)).toBe(true);
    expect(VALID_NEWS_TAGS).toContain('SpaceX');
    expect(VALID_NEWS_TAGS).toContain('NASA');
    expect(VALID_NEWS_TAGS).toContain('ISS');
  });
});
