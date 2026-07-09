import type { DoctorReport } from '../types'

type Props = {
  report: DoctorReport | null
  loading: boolean
}

export function ReadyGate({ report, loading }: Props) {
  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 80 32" className="h-8 w-20 text-text-dim" fill="none">
          <path d="M4 16 H76" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
          <path d="M4 8 V24" stroke="currentColor" strokeWidth="1" />
          <path d="M76 8 V24" stroke="currentColor" strokeWidth="1" />
        </svg>
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-dim">
          Running…
        </span>
      </div>
    )
  }

  if (!report) return null

  const ready = report.ready
  const warnCount = report.summary.warn

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="relative flex items-center">
        <svg viewBox="0 0 120 40" className="absolute -inset-x-2 h-10 w-28" fill="none">
          <path
            d="M8 20 Q60 4 112 20 Q60 36 8 20"
            stroke={ready ? 'oklch(0.72 0.13 160 / 0.4)' : 'oklch(0.62 0.18 25 / 0.4)'}
            strokeWidth="1"
          />
          <path d="M4 20 H116" stroke="currentColor" strokeWidth="0.5" className="text-border" />
        </svg>
        <span
          className={`relative font-mono text-lg font-medium uppercase tracking-[0.25em] ${
            ready ? 'text-pass' : 'text-fail'
          }`}
        >
          {ready ? 'Ready' : 'Blocked'}
        </span>
      </div>
      {ready && warnCount > 0 && (
        <span className="font-mono text-[10px] text-warn">
          {warnCount} warning{warnCount > 1 ? 's' : ''} — review before mainnet
        </span>
      )}
    </div>
  )
}
