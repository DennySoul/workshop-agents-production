import 'dotenv/config';
import { Index as UpstashIndex } from '@upstash/vector'
import { parse } from 'csv-parse/sync';
import fs from 'node:fs';
import path from 'node:path';
import ora from 'ora';

const index = new UpstashIndex({
  url: process.env.UPSTASH_VECTOR_REST_URL as unknown as string,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN as string,
});

const indexMovieData = async () => {
  const spinner = ora('Reading data...').start();
  const moviePath = path.join(process.cwd(), 'src/rag/imdb_movie_dataset.csv');
  const data = fs.readFileSync(moviePath, 'utf-8');
  const records = parse(data, { columns: true, skip_empty_lines: true, });

  spinner.text = 'Starting indexing...';

  for (const record of records) {
    spinner.text = `Indexing ${record.Title}...`;

    const textToVectorize = `${record.Title}. ${record.Genre}. ${record.Descritpion}.`;

    try {
      await index.upsert({
        id: record.Title,
        data: textToVectorize,
        metadata: {
          title: record.Title,
          year: Number(record.Year),
          genre: record.Genre,
          director: record.Director,
          actors: record.Actors,
          rating: record.Rating,
          metascore: Number(record.Metascore),
          votes: Number(record.Votes),
          revenue: Number(record.Revenue),
        }
      })
    } catch (error) {
      spinner.fail(`Error indexing ${record.Title}`);
      console.error(error);
    }
  }

  spinner.text = 'All records indexed';
}

await indexMovieData();


