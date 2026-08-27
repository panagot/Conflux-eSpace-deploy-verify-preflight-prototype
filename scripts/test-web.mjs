#!/usr/bin/env node
const WEB = process.env.VERIFYFLOW_WEB ?? 'http://localhost:5180'

const routes = ['/', '/usage', '/milestones']
let passed = 0
let failed = 0

console.log('\nVerifyFlow web route tests\n')
console.log(`  Target: ${WEB}\n`)

for (const route of routes) {
  try {
    const res = await fetch(`${WEB}${route}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()
    if (!html.includes('VerifyFlow')) throw new Error('missing app shell')
    passed++
    console.log(`  ✓ ${route}`)
  } catch (e) {
    failed++
    console.log(`  ✗ ${route}`)
    console.log(`    ${e instanceof Error ? e.message : e}`)
  }
}

console.log(`\nSummary: ${passed} pass, ${failed} fail\n`)
process.exit(failed > 0 ? 1 : 0)
