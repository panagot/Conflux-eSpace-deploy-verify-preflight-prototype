import type { DoctorReport } from '../types'
import { formatDuration } from '../lib/checkPhases'

type Props = {
  report: DoctorReport
  mode: 'doctor' | 'payload'
  chainId: number
}

export function RunMeta({ report, mode, chainId }: Props) {
  const totalMs = report.checks.reduce((sum, c) => sum + (c.durationMs ?? 0), 0)
  const rpcShort = report.rpcUrl.replace(/^https?:\/\//, '')

  return (
    <div className="rounded-lg border border-border bg-surface-1/80 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[11px]">
        <span className="text-text-dim">
          run{' '}
          <span className="text-text">
            {mode === 'payload' ? 'lint-only' : 'full doctor'}
          </span>
        </span>
        <span className="text-text-dim">
          network <span className="text-accent">{report.network}</span>
          <span className="text-text-dim"> · </span>
          <span className="text-text">chainId {chainId}</span>
        </span>
        {totalMs > 0 && (
          <span className="text-text-dim">
            wall <span className="text-text">{formatDuration(totalMs)}</span>
            <span className="text-text-dim"> sum of probe times</span>
          </span>
        )}
        <span className="min-w-0 truncate text-text-dim sm:ml-auto" title={report.rpcUrl}>
          rpc <span className="text-text">{rpcShort}</span>
        </span>
      </div>
    </div>
  )
}
