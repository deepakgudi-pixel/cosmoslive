import axios from 'axios';
import { z } from 'zod';
import { getCache, setCache } from '../lib/cache.js';
import { TTL, NewsResponseSchema, NewsArticleSchema } from './types.js';
import type { NewsArticle } from './types.js';

export const VALID_NEWS_TAGS = ['SpaceX', 'NASA', 'ISS', 'Mars', 'Moon', 'Launches', 'Webb', 'ESA', 'ISRO'];

export async function fetchSpaceNews(limit = 30, offset = 0): Promise<{ count?: number; results: NewsArticle[] }> {
  const cacheKey = `news:${limit}:${offset}`;
  const cached = await getCache(cacheKey);
  if (cached) return NewsResponseSchema.parse(cached);

  const { data } = await axios.get('https://api.spaceflightnewsapi.net/v4/articles/', {
    params: { limit, offset, ordering: '-published_at' },
    timeout: 12000,
  });

  const parsed = NewsResponseSchema.parse(data);
  await setCache(cacheKey, parsed, TTL.NEWS);
  return parsed;
}

export async function fetchFilteredNews(limit = 30, offset = 0, tag?: string) {
  let data = await fetchSpaceNews(limit + (tag ? 50 : 0), offset);

  if (tag && VALID_NEWS_TAGS.includes(tag)) {
    const filtered = data.results.filter(
      (article) =>
        article.title?.toLowerCase().includes(tag.toLowerCase()) ||
        article.summary?.toLowerCase().includes(tag.toLowerCase()) ||
        article.news_site?.toLowerCase().includes(tag.toLowerCase())
    );
    data = { ...data, results: filtered.slice(0, limit) };
  }

  return data;
}
