import path from 'node:path';
import { BoampClient } from './boampClient.js';
import { slugify } from '../utils/text.js';
import { writeJson } from '../utils/fileWriter.js';

export async function runExploration({ projectRoot }) {
  const client = new BoampClient();
  const outputRaw = path.join(projectRoot, 'output/raw');
  const successes = [];
  const failures = [];

  const tasks = [
    { name: 'no-filter', file: 'boamp-no-filter.json', params: { limit: 5 } },
    ...['espaces verts', 'nettoyage', 'entretien paysager', 'élagage', 'maintenance informatique'].map((q) => ({
      name: `query-${q}`,
      file: `boamp-query-${slugify(q)}.json`,
      params: { limit: 10, q }
    })),
    { name: 'pagination-1', file: 'boamp-pagination-page-1.json', params: { limit: 10, offset: 0 } },
    { name: 'pagination-2', file: 'boamp-pagination-page-2.json', params: { limit: 10, offset: 10 } },
    { name: 'pagination-3', file: 'boamp-pagination-page-3.json', params: { limit: 10, offset: 20 } },
    { name: 'select-all', file: 'boamp-select-all.json', params: { limit: 5, select: '*' } },
    { name: 'where-date', file: 'boamp-where-date.json', params: { limit: 5, where: "dateparution >= date'2026-01-01'" } },
    { name: 'where-objet', file: 'boamp-where-objet.json', params: { limit: 5, where: 'contains(objet, "espaces verts")' } },
    { name: 'where-dept', file: 'boamp-where-dept.json', params: { limit: 5, where: 'departement="69"' } }
  ];

  const responses = {};
  for (const task of tasks) {
    const result = await client.fetchRecords(task.params);
    responses[task.name] = result;
    await writeJson(path.join(outputRaw, task.file), result);
    if (result.ok) successes.push({ name: task.name, url: result.url });
    else failures.push({ name: task.name, url: result.url, error: result.error, details: result.details });
  }

  return { responses, successes, failures };
}
