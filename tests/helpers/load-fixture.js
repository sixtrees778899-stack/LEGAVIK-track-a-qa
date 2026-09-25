import { readFile } from 'node:fs/promises';
export async function loadJson(relativePath){return JSON.parse(await readFile(new URL(relativePath,import.meta.url),'utf8'));}
