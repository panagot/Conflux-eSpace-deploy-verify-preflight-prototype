#!/usr/bin/env node
/**
 * API integration tests — requires server on :8792
 * Start with: npm run dev (or npm run start --workspace=server)
 */
const API = process.env.VERIFYFLOW_API ?? 'http://localhost:8792'

let passed = 0
let failed = 0

async function test(name, fn) {
  try {
    await fn()
    passed++
    console.log(`  ✓ ${name}`)
  } catch (e) {
    failed++
    console.log(`  ✗ ${name}`)
    console.log(`    ${e instanceof Error ? e.message : e}`)
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

console.log('\nVerifyFlow API tests\n')
console.log(`  Target: ${API}\n`)

await test('GET /api/health', async () => {
  const res = await fetch(`${API}/api/health`)
  assert(res.ok, `HTTP ${res.status}`)
  const data = await res.json()
  assert(data.ok === true, 'health ok')
  assert(data.service === 'verifyflow', 'service name')
})

await test('GET /api/networks', async () => {
  const res = await fetch(`${API}/api/networks`)
  const data = await res.json()
  assert(data.networks?.length === 2, 'two networks')
  const testnet = data.networks.find((n) => n.id === 'testnet')
  assert(testnet?.chainId === 71, 'testnet chainId')
})

await test('POST /api/doctor testnet', async () => {
  const res = await fetch(`${API}/api/doctor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ network: 'testnet' }),
  })
  const data = await res.json()
  assert(data.checks?.length >= 3, 'at least 3 checks')
  assert(data.summary.pass >= 2, 'mostly passing on public RPC')
})

await test('POST /api/doctor with bad evmVersion', async () => {
  const res = await fetch(`${API}/api/doctor`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      network: 'testnet',
      verifyPayload: {
        compilerVersion: 'v0.8.24+commit.e11b9ed9',
        evmVersion: 'default',
        optimizationUsed: true,
        runs: 200,
        contractName: 'MyToken',
      },
    }),
  })
  const data = await res.json()
  assert(data.ready === false, 'not ready')
  assert(data.summary.fail >= 1, 'has failure')
  const evm = data.checks.find((c) => c.id === 'verify-evmversion')
  assert(evm?.status === 'fail', 'evmversion fail')
})

await test('POST /api/lint-payload', async () => {
  const res = await fetch(`${API}/api/lint-payload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      raw: JSON.stringify({ evmVersion: 'default', compilerVersion: 'v0.8.24+commit.e11b9ed9' }),
    }),
  })
  const data = await res.json()
  assert(data.ok === false, 'lint rejects default')
})

await test('POST /api/lint-payload invalid body', async () => {
  const res = await fetch(`${API}/api/lint-payload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  assert(res.status === 400, '400 on empty body')
})

console.log(`\nSummary: ${passed} pass, ${failed} fail\n`)
process.exit(failed > 0 ? 1 : 0)
