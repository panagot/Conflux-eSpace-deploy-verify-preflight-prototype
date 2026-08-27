#!/usr/bin/env node
/**
 * CLI integration tests — builds core + cli first
 */
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const cli = join(root, 'cli', 'dist', 'index.js')

let passed = 0
let failed = 0

function run(name, args, expectCode = 0) {
  const r = spawnSync('node', [cli, ...args], {
    cwd: root,
    encoding: 'utf8',
    timeout: 60_000,
  })
  const ok = r.status === expectCode
  if (ok) {
    passed++
    console.log(`  ✓ ${name}`)
  } else {
    failed++
    console.log(`  ✗ ${name} (exit ${r.status}, expected ${expectCode})`)
    if (r.stderr) console.log(`    ${r.stderr.slice(0, 200)}`)
  }
  return r.stdout ?? ''
}

console.log('\nVerifyFlow CLI tests\n')

run('doctor --help exits 0', ['--help'], 0)
run('networks lists endpoints', ['networks'], 0)
run('doctor testnet passes', ['doctor', '--network', 'testnet'], 0)

const badOut = run('doctor with bad payload fails', [
  'doctor',
  '--network',
  'testnet',
  '--payload',
  join(root, 'examples', 'verify-payload-bad.json'),
], 1)

if (!badOut.includes('evmversion=default') && !badOut.includes('default is rejected')) {
  failed++
  passed--
  console.log('  ✗ bad payload output mentions evmversion rejection')
} else {
  console.log('  ✓ bad payload output mentions evmversion rejection')
  passed++
}

console.log(`\nSummary: ${passed} pass, ${failed} fail\n`)
process.exit(failed > 0 ? 1 : 0)
