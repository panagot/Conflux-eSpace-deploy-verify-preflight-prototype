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

export type NetworkInfo = {
  id: string
  label: string
  chainId: number
  defaultRpc: string
  explorer: string
  currency: string
  rpcAlternatives: string[]
}
