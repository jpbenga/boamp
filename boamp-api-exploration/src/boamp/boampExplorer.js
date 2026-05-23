import path from 'node:path';
import { BoampClient } from './boampClient.js';
import { slugify } from '../utils/text.js';
import { writeJson } from '../utils/fileWriter.js';

const SAFE_WHERES = {
  textContainsEspacesVerts: {
    where: 'objet like "%espaces verts%"',
    fallbackQ: 'espaces verts',
    fallbackReason: 'ODSQL text filter fallback to q + local post-filter'
  },
  department69: {
    where: 'code_departement="69" OR code_departement_prestation="69"',
    fallbackQ: '69',
    fallbackReason: 'ODSQL location filter fallback to q + local post-filter'
  }
};

function localPostFilter(results, mode) {
  if (mode === 'textContainsEspacesVerts') {
    return results.filter((r) => String(r?.objet ?? '').toLowerCase().includes('espaces verts'));
  }
  if (mode === 'department69') {
    return results.filter((r) => ['69'].includes(String(r?.code_departement ?? r?.code_departement_prestation ?? '')));
  }
  return results;
}

async function runSafeWhere({ client, mode, params }) {
  const primary = await client.fetchRecords(params);
  if (primary.ok) return primary;

  const fallback = SAFE_WHERES[mode];
  if (!fallback) return primary;

  const fallbackResult = await client.fetchRecords({ limit: params.limit ?? 10, q: fallback.fallbackQ });
  if (!fallbackResult.ok) return primary;

  const filtered = localPostFilter(fallbackResult.data?.results ?? [], mode);
  return {
    ...fallbackResult,
    fallbackUsed: true,
    fallbackReason: fallback.fallbackReason,
    fallbackOriginalError: primary.details,
    data: {
      ...fallbackResult.data,
      total_count: filtered.length,
      results: filtered
    }
  };
}

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
    { name: 'where-objet', file: 'boamp-where-objet.json', params: { limit: 20, where: SAFE_WHERES.textContainsEspacesVerts.where }, safeMode: 'textContainsEspacesVerts' },
    { name: 'where-dept', file: 'boamp-where-dept.json', params: { limit: 20, where: SAFE_WHERES.department69.where }, safeMode: 'department69' }
  ];

  const responses = {};
  for (const task of tasks) {
    const result = task.safeMode
      ? await runSafeWhere({ client, mode: task.safeMode, params: task.params })
      : await client.fetchRecords(task.params);
    responses[task.name] = result;
    await writeJson(path.join(outputRaw, task.file), result);
    if (result.ok) successes.push({ name: task.name, url: result.url, fallbackUsed: !!result.fallbackUsed, fallbackReason: result.fallbackReason });
    else failures.push({ name: task.name, url: result.url, error: result.error, details: result.details });
  }

  return { responses, successes, failures };
}
