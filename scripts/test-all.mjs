#!/usr/bin/env node
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function run(cmd, args, label) {
  console.log(`\n── ${label} ──\n`)
  const r = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', shell: true })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

console.log('\nVerifyFlow — full test suite\n')

run('npm', ['run', 'build', '--workspace=core'], 'Build core')
run('npm', ['run', 'test', '--workspace=core'], 'Core unit tests')

run('npm', ['run', 'build', '--workspace=cli'], 'Build CLI')
run('node', ['scripts/test-cli.mjs'], 'CLI integration')

// API tests need running server
const health = await fetch('http://localhost:8792/api/health').catch(() => null)
if (health?.ok) {
  run('node', ['scripts/test-api.mjs'], 'API integration')
} else {
  console.log('\n── API integration (skipped) ──\n')
  console.log('  Server not running on :8792 — start with npm run dev')
  console.log('  Run manually: npm run test:api')
}

const web = await fetch('http://localhost:5180/').catch(() => null)
if (web?.ok) {
  run('node', ['scripts/test-web.mjs'], 'Web route tests')
} else {
  console.log('\n── Web routes (skipped) ──\n')
  console.log('  Dashboard not running on :5180')
}

console.log('\nAll executed tests passed.\n')
