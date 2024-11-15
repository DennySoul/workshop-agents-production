import type { ToolFn } from '../../types.ts';
import zod from 'zod';
import { queryMovies } from '../rag/query.ts'

export const movieSearchToolDefinition = {
  name: 'movieSearch',
  parameters: zod.object({
    query: zod.string().describe('query used to search for movies'),
    genre: zod.string().describe('filter value for movie genre filter'),
    director: zod.string().describe('filter value for movie director filter'),
  }),
  description: 'Use this tool to find movies or retrieve info about movies for movies related questions'
};

type Args = zod.infer<typeof movieSearchToolDefinition.parameters>;

export const movieSearch: ToolFn<Args> = async ({ toolArgs }) => {
  const { query, genre, director } = toolArgs;
  const filters = {
    ...(genre && { genre }),
    ...(director && { director }),
  };

  let searchResults;

  try {
    searchResults = await queryMovies({ query, filters });
  } catch (error) {
    console.error(error);

    return 'Error: could not query DB to get movies.'
  }

  const formattedResults = searchResults.map((res) => ({
    title: res.metadata?.title,
    year: res.metadata?.year,
    genre: res.metadata?.genre,
    director: res.metadata?.director,
    actors: res.metadata?.actors,
    rating: res.metadata?.rating,
    description: res.data,
  }));

  return JSON.stringify(formattedResults, null, 2);
}