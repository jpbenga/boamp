import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');

async function readJson(relPath, fallback) {
  try {
    return JSON.parse(await readFile(path.join(root, relPath), 'utf8'));
  } catch {
    return fallback;
  }
}

const round = (n) => Math.round(n * 10) / 10;

function decisionSummary(results) {
  const out = { 'hors cible': 0, 'à examiner': 0, pertinent: 0, prioritaire: 0 };
  for (const r of results) out[r.decision] = (out[r.decision] ?? 0) + 1;
  return out;
}

function buildDashboardData(report, schema, normalized, matchingByCompany) {
  const success = Number(report.match(/- Succès: (\d+)/)?.[1] ?? 0);
  const failed = Number(report.match(/- Échecs: (\d+)/)?.[1] ?? 0);
  const total = Number(report.match(/- Nombre total d'appels: (\d+)/)?.[1] ?? 0);
  const runDate = report.match(/## 1\. Date d’exécution\n- (.+)/)?.[1] ?? null;

  const companies = Array.isArray(matchingByCompany) ? matchingByCompany : [];
  const totalMatches = companies.reduce((a, c) => a + (c.results?.length ?? 0), 0);
  const flat = companies.flatMap((c) => (c.results ?? []).map((r) => ({ ...r, companyId: c.companyId, companyName: c.companyName })));
  const avgScore = flat.length ? round(flat.reduce((a, r) => a + (r.score ?? 0), 0) / flat.length) : 0;
  const haveDeadline = normalized.filter((r) => !!r.responseDeadline).length;

  return {
    runDate,
    calls: { total, success, failed },
    matching: { total: totalMatches, averageScore: avgScore },
    schema: { fieldCount: Object.keys(schema).length },
    completeness: { responseDeadlinePct: normalized.length ? round((haveDeadline / normalized.length) * 100) : 0 },
    steps: {
      step1: [
        { label: 'Profils entreprise', value: `${companies.length} profils actifs` },
        { label: 'Corpus scoré', value: `${totalMatches} scorings multi-profils` }
      ],
      step2: [
        { label: 'Inventaire de champs', value: `${Object.keys(schema).length} champs détectés` },
        { label: 'Complétude date limite', value: `${haveDeadline}/${normalized.length} annonces` }
      ],
      step5: [{ label: 'Score moyen global', value: `${avgScore}/100` }],
      step6: [
        { label: 'Statut technique', value: failed === 0 ? 'GO' : 'NO-GO' },
        { label: 'Statut métier', value: flat.some((r) => r.decision === 'pertinent' || r.decision === 'prioritaire') ? 'GO sous conditions' : 'NO-GO' }
      ]
    },
    companyProfiles: companies.map((c) => ({
      companyId: c.companyId,
      companyName: c.companyName,
      activity: c.activity,
      totals: decisionSummary(c.results ?? []),
      averageScore: (c.results ?? []).length ? round((c.results ?? []).reduce((a, r) => a + (r.score ?? 0), 0) / c.results.length) : 0,
      offers: (c.results ?? []).map((r) => ({
        opportunityId: r.opportunityId,
        title: r.title,
        score: r.score,
        decision: r.decision,
        reasons: r.reasons,
        risks: r.risks,
        buyerName: r.normalizedOpportunity?.buyerName ?? null,
        publicationDate: r.normalizedOpportunity?.publicationDate ?? null,
        responseDeadline: r.normalizedOpportunity?.responseDeadline ?? null,
        sourceUrl: r.normalizedOpportunity?.sourceUrl ?? null
      }))
    })),
    errors: [
      ...(failed > 0 ? [`${failed} appels API en échec détectés.`] : []),
      ...(haveDeadline === 0 ? ['Aucune date limite détectée dans le sample normalisé.'] : [])
    ]
  };
}

const server = http.createServer(async (req, res) => {
  if (!req.url) return res.end();
  if (req.url === '/api/dashboard') {
    const [report, schema, normalized, matching] = await Promise.all([
      readFile(path.join(root, 'docs/api-exploration-report.md'), 'utf8').catch(() => ''),
      readJson('output/schemas/boamp-field-inventory.json', {}),
      readJson('output/normalized/boamp-normalized-sample.json', []),
      readJson('output/reports/matching-results.json', [])
    ]);
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(buildDashboardData(report, schema, normalized, matching)));
    return;
  }
  if (req.url === '/' || req.url === '/dashboard') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(await readFile(path.join(root, 'public/dashboard.html'), 'utf8'));
    return;
  }
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(Number(process.env.PORT ?? 4173), () => console.log('Dashboard running on http://localhost:4173'));
