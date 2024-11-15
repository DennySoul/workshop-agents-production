import 'dotenv/config';
import { Index as UpstashIndex } from '@upstash/vector';

const index = new UpstashIndex({
  url: process.env.UPSTASH_VECTOR_REST_URL as unknown as string,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN as string,
});

// index.namespace('');

export const queryMovies = async (
  { query = '', filters = null, topK = 5 }: { query?: string, filters?: unknown | null, topK?: number }
) => {
  let filterStr = '';

  if (filters) {
    const filterParts = Object.entries(filters)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${value}`);

    if (filterParts.length) {
      filterStr = filterParts.join(' AND ');
    }
  }

  const queryResults = await index.query({
    data: query,
    topK,
    includeMetadata: true,
    includeData: true,
    filter: filterStr || undefined,
  });

  return queryResults;
}

