// Source records for Ge Jiayu / https://gejiayu.top/. Unsigned, local, no tracking.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const FILES = Object.freeze([
  'assets/hero-bg.webp', 'index.html', 'css/home.css', 'css/style.css',
  'js/home.js', 'js/main.js', 'README.md', 'LICENSE', 'ASSET-RIGHTS.md',
  'scripts/provenance.mjs', 'scripts/provenance.test.mjs',
]);
const OWNER = 'Ge Jiayu';
const WEBSITE = 'https://gejiayu.top/';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const RECORD = 'provenance.json';
const PRIOR_HERO = Object.freeze({
  path: 'assets/hero-bg.webp',
  sha256: 'ce55f004a8ce9b1f2428b072f2a3e2e40d338d2f51ec99f84466c45ac8c37928',
  gitRevision: '5304d9c4ee8a7f9cdefce88c1d686edd67a54654',
  note: 'Previously public, unmarked homepage artwork. Existing history is unchanged.',
});

export function fingerprint(file) {
  const data = readFileSync(file);
  return { sha256: createHash('sha256').update(data).digest('hex'), bytes: data.length };
}

export function buildRecord(root, { recordedAt, sourceRevision }) {
  return {
    schemaVersion: 1,
    kind: 'unsigned-source-record',
    maintainer: OWNER,
    originalWebsite: WEBSITE,
    recordedAt,
    sourceRevisionAtRecording: sourceRevision,
    algorithm: 'sha256',
    imageReusePolicy: `${WEBSITE}ASSET-RIGHTS.md`,
    priorVersions: [{ ...PRIOR_HERO }],
    files: FILES.map(path => ({ path, ...fingerprint(resolve(root, path)) })),
  };
}

function validateRecord(record) {
  if (record?.schemaVersion !== 1 || record.kind !== 'unsigned-source-record' ||
      record.maintainer !== OWNER || record.originalWebsite !== WEBSITE ||
      record.algorithm !== 'sha256' ||
      !Number.isFinite(Date.parse(record.recordedAt)) ||
      !/^[0-9a-f]{40}$/.test(record.sourceRevisionAtRecording || '') ||
      record.imageReusePolicy !== `${WEBSITE}ASSET-RIGHTS.md`) {
    throw new Error('Invalid source-record header.');
  }
  if (!Array.isArray(record.files) || record.files.length !== FILES.length) {
    throw new Error('The source record must contain every managed file.');
  }
  const paths = new Set();
  for (const file of record.files) {
    if (!FILES.includes(file?.path) || paths.has(file.path) ||
        !/^[0-9a-f]{64}$/.test(file.sha256 || '') ||
        !Number.isSafeInteger(file.bytes) || file.bytes < 0) {
      throw new Error('Invalid, duplicate, or unexpected file in source record.');
    }
    paths.add(file.path);
  }
  if (!Array.isArray(record.priorVersions) || record.priorVersions.length !== 1 ||
      Object.keys(PRIOR_HERO).some(key => record.priorVersions[0]?.[key] !== PRIOR_HERO[key])) {
    throw new Error('Invalid prior-version record.');
  }
}

export function checkRecord(root, record) {
  validateRecord(record);
  const failures = [];
  for (const file of record.files) {
    try {
      const actual = fingerprint(resolve(root, file.path));
      if (actual.sha256 !== file.sha256 || actual.bytes !== file.bytes) {
        failures.push(`${file.path}: fingerprint mismatch`);
      }
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      failures.push(`${file.path}: file missing`);
    }
  }
  return failures;
}

export function compareFile(file, record) {
  validateRecord(record);
  const { sha256 } = fingerprint(file);
  return {
    sha256,
    current: record.files.filter(item => item.sha256 === sha256).map(item => item.path),
    prior: record.priorVersions.filter(item => item.sha256 === sha256).map(item => item.path),
  };
}

function run(args) {
  const mode = args[0] || '--check';
  if (mode === '--write' && args.length === 1) {
    const sourceRevision = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: ROOT, encoding: 'utf8',
    }).trim();
    const record = buildRecord(ROOT, { recordedAt: new Date().toISOString(), sourceRevision });
    validateRecord(record);
    writeFileSync(resolve(ROOT, RECORD), `${JSON.stringify(record, null, 2)}\n`);
    console.log(`Recorded ${record.files.length} files. This is an unsigned source record, not proof of authorship.`);
  } else if (mode === '--check' && args.length <= 1) {
    const record = JSON.parse(readFileSync(resolve(ROOT, RECORD), 'utf8'));
    const failures = checkRecord(ROOT, record);
    if (failures.length) {
      console.error(failures.join('\n'));
      process.exitCode = 1;
    } else {
      console.log(`OK: all ${record.files.length} recorded fingerprints match.`);
    }
  } else if (mode === '--compare' && args.length === 2) {
    const record = JSON.parse(readFileSync(resolve(ROOT, RECORD), 'utf8'));
    const result = compareFile(resolve(args[1]), record);
    console.log(`SHA-256: ${result.sha256}`);
    for (const path of result.current) console.log(`Exact-byte match: ${path}`);
    for (const path of result.prior) console.log(`Exact-byte match to prior public version: ${path}`);
    if (!result.current.length && !result.prior.length) {
      console.log('No exact-byte match. Edits or re-encoding can change a fingerprint; this is not an originality verdict.');
    }
  } else {
    throw new Error('Usage: node scripts/provenance.mjs [--write | --check | --compare FILE]');
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { run(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
