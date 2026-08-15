import { useState } from 'react'
import type { DoctorReport } from '../types'
import { formatDuration } from '../lib/checkPhases'

type Props = {
  report: DoctorReport
  mode: 'doctor' | 'payload'
  chainId: number
  payloadRaw?: string
}

export function RunMeta({ report, mode, chainId, payloadRaw }: Props) {
  const [copied, setCopied] = useState(false)
  const totalMs = report.checks.reduce((sum, c) => sum + (c.durationMs ?? 0), 0)
  const rpcShort = report.rpcUrl.replace(/^https?:\/\//, '')
  const rpcCheck = report.checks.find((c) => c.id === 'rpc-reachability')
  const blockNumber = rpcCheck?.meta?.blockNumber

  const copyCurl = () => {
    let verifyPayload: unknown
    try {
      verifyPayload = payloadRaw?.trim() ? JSON.parse(payloadRaw) : undefined
    } catch {
      verifyPayload = undefined
    }
    const body = JSON.stringify(
      {
        network: report.network,
        rpcUrl: report.rpcUrl || undefined,
        verifyPayload,
      },
      null,
      2,
    )
    const origin = window.location.origin
    const snippet = `curl -sS -X POST ${origin}/api/doctor \\\n  -H 'content-type: application/json' \\\n  -d '${body.replace(/'/g, "'\\''")}'`
    void navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    })
  }

  return (
    <div className="rounded-lg border border-border bg-surface-1/80 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[11px]">
        <span className="text-text-dim">
          run{' '}
          <span className="text-text">{mode === 'payload' ? 'lint only' : 'full preflight'}</span>
        </span>
        <span className="text-text-dim">
          network <span className="text-accent">{report.network}</span>
          <span className="text-text-dim"> · </span>
          <span className="text-text">chainId {chainId}</span>
        </span>
        {blockNumber != null && (
          <span className="text-text-dim">
            live block <span className="text-text">#{String(blockNumber)}</span>
          </span>
        )}
        {totalMs > 0 && (
          <span className="text-text-dim">
            wall <span className="text-text">{formatDuration(totalMs)}</span>
          </span>
        )}
        <span className="min-w-0 truncate text-text-dim" title={report.rpcUrl}>
          rpc <span className="text-text">{rpcShort}</span>
        </span>
        {mode === 'doctor' && (
          <button
            type="button"
            onClick={copyCurl}
            className="text-accent hover:underline sm:ml-auto"
          >
            {copied ? 'copied' : 'copy curl'}
          </button>
        )}
      </div>
    </div>
  )
}
