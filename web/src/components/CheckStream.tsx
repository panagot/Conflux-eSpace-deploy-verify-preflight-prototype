import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'
import type { CheckResult } from '../types'
import { formatDuration } from '../lib/checkPhases'

type Props = {
  checks: CheckResult[]
  pinnedFail?: string | null
}

const dotColor: Record<CheckResult['status'], string> = {
  pass: 'bg-pass',
  warn: 'bg-warn',
  fail: 'bg-fail',
  skip: 'bg-skip',
}

function CheckItem({ check, index }: { check: CheckResult; index: number }) {
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.06, duration: 0.25 }}
      className="relative grid grid-cols-[20px_1fr_auto] gap-x-4 gap-y-1 pb-6 last:pb-0"
      style={{ '--i': index } as CSSProperties}
    >
      <div className="flex flex-col items-center">
        <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dotColor[check.status]}`} />
        <span className="mt-1 w-px flex-1 bg-border" />
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-text">{check.name}</h3>
        <p className="mt-0.5 text-sm text-text-muted">{check.message}</p>
        {check.detail && (
          <p className="mt-1 font-mono text-[11px] leading-relaxed text-text-dim">{check.detail}</p>
        )}
      </div>

      {check.durationMs != null && (
        <span className="font-mono text-[11px] tabular-nums text-text-dim">
          {formatDuration(check.durationMs)}
        </span>
      )}
    </motion.article>
  )
}

export function CheckStream({ checks, pinnedFail }: Props) {
  return (
    <div className="space-y-4">
      {pinnedFail && (
        <div className="rounded border border-fail/40 bg-fail/10 px-4 py-3">
          <p className="font-mono text-xs uppercase tracking-wider text-fail">Blocked</p>
          <p className="mt-1 text-sm text-text-muted">{pinnedFail}</p>
        </div>
      )}

      <div className="divide-y-0">
        {checks.map((check, i) => (
          <CheckItem key={`${check.id}-${i}`} check={check} index={i} />
        ))}
      </div>
    </div>
  )
}
