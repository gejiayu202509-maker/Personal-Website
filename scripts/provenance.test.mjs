import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { FILES, buildRecord, checkRecord, compareFile } from './provenance.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'gejiayu-provenance-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const path of FILES) {
    const destination = join(root, path);
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, `fixture: ${path}`);
  }
  const record = buildRecord(root, {
    recordedAt: '2026-10-14T00:00:00.000Z', sourceRevision: 'a'.repeat(40),
  });
  return { root, record };
}

test('all unchanged files match the record', t => {
  const { root, record } = fixture(t);
  assert.deepEqual(checkRecord(root, record), []);
});

test('an edited asset is reported', t => {
  const { root, record } = fixture(t);
  writeFileSync(join(root, 'assets/hero-bg.webp'), 'changed');
  assert.deepEqual(checkRecord(root, record), ['assets/hero-bg.webp: fingerprint mismatch']);
});

test('a missing file is reported', t => {
  const { root, record } = fixture(t);
  unlinkSync(join(root, 'index.html'));
  assert.deepEqual(checkRecord(root, record), ['index.html: file missing']);
});

test('a record cannot silently omit a managed file', t => {
  const { root, record } = fixture(t);
  record.files.pop();
  assert.throws(() => checkRecord(root, record), /every managed file/);
});

test('duplicate records and unexpected paths are rejected', t => {
  const { root, record } = fixture(t);
  record.files[1] = { ...record.files[0] };
  assert.throws(() => checkRecord(root, record), /duplicate/);
  record.files[1].path = '../private-image.webp';
  assert.throws(() => checkRecord(root, record), /unexpected/);
});

test('invalid maintainer and historic source claims are rejected', t => {
  const { root, record } = fixture(t);
  record.maintainer = 'Someone else';
  assert.throws(() => checkRecord(root, record), /header/);
  record.maintainer = 'Ge Jiayu';
  record.priorVersions[0].sha256 = '0'.repeat(64);
  assert.throws(() => checkRecord(root, record), /prior-version/);
});

test('comparison finds identical bytes and does not mislabel a changed file', t => {
  const { root, record } = fixture(t);
  const file = join(root, 'assets/hero-bg.webp');
  assert.deepEqual(compareFile(file, record).current, ['assets/hero-bg.webp']);
  writeFileSync(file, 're-encoded image');
  const result = compareFile(file, record);
  assert.deepEqual(result.current, []);
  assert.deepEqual(result.prior, []);
});

test('missing comparison targets produce a real error', t => {
  const { root, record } = fixture(t);
  assert.throws(() => compareFile(join(root, 'absent.webp'), record), { code: 'ENOENT' });
});
