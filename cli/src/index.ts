#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { runDoctor, NETWORKS, type NetworkId } from '@verifyflow/core'

const COLORS = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  bold: '\x1b[1m',
}

function statusColor(status: string): string {
  if (status === 'pass') return COLORS.green
  if (status === 'warn') return COLORS.yellow
  if (status === 'fail') return COLORS.red
  return COLORS.dim
}

function printReport(report: Awaited<ReturnType<typeof runDoctor>>) {
  const net = NETWORKS[report.network as NetworkId]
  console.log('')
  console.log(`${COLORS.bold}${COLORS.cyan}VerifyFlow${COLORS.reset} — ${net.label}`)
  console.log(`${COLORS.dim}RPC:${COLORS.reset} ${report.rpcUrl}`)
  console.log(`${COLORS.dim}Ran:${COLORS.reset} ${report.ranAt}`)
  console.log('')

  for (const check of report.checks) {
    const icon =
      check.status === 'pass' ? '✓' : check.status === 'warn' ? '!' : check.status === 'fail' ? '✗' : '–'
    const color = statusColor(check.status)
    const ms = check.durationMs != null ? ` ${COLORS.dim}(${check.durationMs}ms)${COLORS.reset}` : ''
    console.log(`  ${color}${icon}${COLORS.reset} ${COLORS.bold}${check.name}${COLORS.reset}${ms}`)
    console.log(`    ${check.message}`)
    if (check.detail) console.log(`    ${COLORS.dim}${check.detail}${COLORS.reset}`)
  }

  console.log('')
  const { pass, warn, fail, skip } = report.summary
  console.log(
    `Summary: ${COLORS.green}${pass} pass${COLORS.reset}, ${COLORS.yellow}${warn} warn${COLORS.reset}, ${COLORS.red}${fail} fail${COLORS.reset}, ${skip} skip`,
  )
  console.log(
    report.ready
      ? `${COLORS.green}${COLORS.bold}Ready for deploy & verify${COLORS.reset}`
      : `${COLORS.red}${COLORS.bold}Fix failures before deploy${COLORS.reset}`,
  )
  console.log('')
}

function parseArgs(argv: string[]) {
  const args = {
    command: '',
    network: 'testnet' as NetworkId,
    rpc: '',
    payload: '',
    json: false,
  }
  args.command = argv[0] ?? 'help'

  for (let i = 1; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--network' || a === '-n') args.network = (argv[++i] ?? 'testnet') as NetworkId
    else if (a === '--rpc' || a === '-r') args.rpc = argv[++i] ?? ''
    else if (a === '--payload' || a === '-p') args.payload = argv[++i] ?? ''
    else if (a === '--json') args.json = true
    else if (a === '--help' || a === '-h') args.command = 'help'
  }
  return args
}

function printHelp() {
  console.log(`
${COLORS.bold}${COLORS.cyan}VerifyFlow${COLORS.reset} — Conflux eSpace deploy & verify preflight

Usage:
  verifyflow doctor [options]     Run RPC, chainId, explorer & verify payload checks
  verifyflow networks             List supported networks

Options:
  -n, --network <id>   mainnet | testnet (default: testnet)
  -r, --rpc <url>      Override default public RPC
  -p, --payload <path> JSON file with ConfluxScan verify fields to lint
  --json               Print DoctorReport JSON only

Exit codes:
  0  ready (no failing checks)
  1  blocked / error

Examples:
  verifyflow doctor --network testnet --payload examples/bad-verify.json
  verifyflow doctor --network testnet --payload examples/good-verify.json
`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.command === 'help' || args.command === '--help') {
    printHelp()
    process.exit(0)
  }

  if (args.command === 'networks') {
    for (const n of Object.values(NETWORKS)) {
      console.log(`${n.id.padEnd(8)} chainId=${n.chainId}  ${n.defaultRpc}`)
    }
    process.exit(0)
  }

  if (args.command !== 'doctor') {
    console.error(`Unknown command: ${args.command}`)
    printHelp()
    process.exit(1)
  }

  if (!(args.network in NETWORKS)) {
    console.error(`Invalid network: ${args.network}`)
    process.exit(1)
  }

  let verifyPayload
  if (args.payload) {
    try {
      verifyPayload = JSON.parse(readFileSync(args.payload, 'utf8'))
    } catch (e) {
      console.error(`Failed to read payload: ${e instanceof Error ? e.message : e}`)
      process.exit(1)
    }
  }

  const report = await runDoctor({
    network: args.network,
    rpcUrl: args.rpc || undefined,
    verifyPayload,
  })

  if (args.json) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    printReport(report)
  }
  process.exit(report.ready ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
