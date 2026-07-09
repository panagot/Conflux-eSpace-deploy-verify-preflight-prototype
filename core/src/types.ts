export type CheckStatus = 'pass' | 'warn' | 'fail' | 'skip'

export type CheckResult = {
  id: string
  name: string
  status: CheckStatus
  message: string
  detail?: string
  durationMs?: number
  meta?: Record<string, string | number | boolean | null>
}

export type DoctorReport = {
  network: string
  rpcUrl: string
  ranAt: string
  summary: { pass: number; warn: number; fail: number; skip: number }
  checks: CheckResult[]
  ready: boolean
}

export function summarize(checks: CheckResult[]): DoctorReport['summary'] {
  const summary = { pass: 0, warn: 0, fail: 0, skip: 0 }
  for (const c of checks) {
    if (c.status === 'pass') summary.pass++
    else if (c.status === 'warn') summary.warn++
    else if (c.status === 'fail') summary.fail++
    else summary.skip++
  }
  return summary
}

export function isReady(checks: CheckResult[]): boolean {
  return checks.every((c) => c.status !== 'fail')
}
