import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

export async function writeJson(filePath, data) {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export async function writeText(filePath, text) {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, text, 'utf8');
}
