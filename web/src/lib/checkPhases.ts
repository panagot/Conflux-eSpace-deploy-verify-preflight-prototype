import type { CheckResult, CheckStatus } from '../types'

export type RailPhase = 'RPC' | 'Chain' | 'Gas' | 'Explorer' | 'Verify'

export const RAIL_PHASES: RailPhase[] = ['RPC', 'Chain', 'Gas', 'Explorer', 'Verify']

const PHASE_IDS: Record<RailPhase, string[]> = {
  RPC: ['rpc-reachability'],
  Chain: ['rpc-chain-id', 'rpc-reachability'],
  Gas: ['gas-estimate'],
  Explorer: ['explorer-api'],
  Verify: [
    'verify-compiler',
    'verify-evmversion',
    'verify-optimizer',
    'verify-source',
    'verify-bytecode-tip',
  ],
}

export function checksForPhase(phase: RailPhase, checks: CheckResult[]): CheckResult[] {
  const ids = PHASE_IDS[phase]
  const matched = checks.filter((c) => ids.includes(c.id))
  if (phase === 'Chain' && matched.length === 0) return []
  if (phase === 'Chain') {
    const chainFail = matched.find((c) => c.id === 'rpc-chain-id')
    if (chainFail) return [chainFail]
    const rpc = matched.find((c) => c.id === 'rpc-reachability' && c.status === 'pass')
    return rpc ? [rpc] : matched
  }
  return matched
}

export function phaseStatus(
  phase: RailPhase,
  checks: CheckResult[],
  loading: boolean,
  activePhase: RailPhase | null,
): CheckStatus | 'idle' | 'active' {
  const phaseChecks = checksForPhase(phase, checks)

  if (loading && activePhase === phase) return 'active'
  if (phaseChecks.length === 0) {
    if (loading && activePhase && RAIL_PHASES.indexOf(phase) <= RAIL_PHASES.indexOf(activePhase)) {
      return 'active'
    }
    return 'idle'
  }

  if (phaseChecks.some((c) => c.status === 'fail')) return 'fail'
  if (phaseChecks.some((c) => c.status === 'warn')) return 'warn'
  if (phaseChecks.every((c) => c.status === 'pass' || c.status === 'skip')) return 'pass'
  return 'idle'
}

export function getActivePhase(checks: CheckResult[], loading: boolean): RailPhase | null {
  if (!loading) return null
  for (const phase of RAIL_PHASES) {
    const phaseChecks = checksForPhase(phase, checks)
    if (phaseChecks.length === 0) return phase
    if (phaseChecks.some((c) => c.status === 'fail' || c.status === 'warn')) continue
  }
  return 'Verify'
}

export function firstFailMessage(checks: CheckResult[]): string | null {
  const fail = checks.find((c) => c.status === 'fail')
  return fail ? `${fail.name}: ${fail.message}` : null
}

export function phaseForCheckId(id: string): RailPhase | null {
  for (const phase of RAIL_PHASES) {
    if (PHASE_IDS[phase].includes(id)) return phase
  }
  return null
}

export function formatDuration(ms: number): string {
  return `${ms.toLocaleString('en-US')}ms`
}
