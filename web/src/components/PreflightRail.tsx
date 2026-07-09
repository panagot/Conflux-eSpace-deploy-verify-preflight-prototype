import { motion } from 'framer-motion'
import type { CheckResult } from '../types'
import {
  RAIL_PHASES,
  getActivePhase,
  phaseStatus,
  checksForPhase,
  type RailPhase,
} from '../lib/checkPhases'

type Props = {
  checks: CheckResult[]
  loading: boolean
  empty: boolean
}

const statusColor: Record<string, string> = {
  idle: 'text-text-dim border-text-dim/30',
  active: 'text-accent border-accent',
  pass: 'text-pass border-pass',
  warn: 'text-warn border-warn',
  fail: 'text-fail border-fail',
}

const statusFill: Record<string, string> = {
  idle: 'bg-surface-2',
  active: 'bg-accent/20',
  pass: 'bg-pass/20',
  warn: 'bg-warn/20',
  fail: 'bg-fail/20',
}

function PhaseNode({
  phase,
  status,
  message,
  index,
}: {
  phase: RailPhase
  status: string
  message?: string
  index: number
}) {
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <div className="flex flex-1 flex-col items-center gap-2" title={message}>
      <motion.div
        initial={reduceMotion ? false : { scale: 0.92, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24, delay: index * 0.05 }}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 font-mono text-[10px] font-medium uppercase tracking-wide ${statusColor[status]} ${statusFill[status]}`}
      >
        {phase.slice(0, 3)}
        {status === 'active' && !reduceMotion && (
          <span className="absolute inset-0 animate-ping rounded-full border border-accent opacity-30" />
        )}
      </motion.div>
      <span className="font-mono text-[10px] uppercase tracking-wider text-text-dim">{phase}</span>
    </div>
  )
}

export function PreflightRail({ checks, loading, empty }: Props) {
  const activePhase = getActivePhase(checks, loading)

  if (empty && !loading) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface-1/50 px-6 py-10">
        <div className="flex items-center justify-center gap-2 opacity-40">
          {RAIL_PHASES.map((phase, i) => (
            <div key={phase} className="flex items-center">
              <div className="h-8 w-8 rounded-full border border-dashed border-text-dim/40" />
              {i < RAIL_PHASES.length - 1 && (
                <div className="mx-1 h-px w-6 border-t border-dashed border-text-dim/30 md:w-12" />
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-text-muted">
          No preflight run yet. Select testnet and execute preflight.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-surface-1 px-4 py-6 md:px-8">
      <div className="flex items-start">
        {RAIL_PHASES.map((phase, i) => {
          const status = phaseStatus(phase, checks, loading, activePhase)
          const phaseChecks = checksForPhase(phase, checks)
          const failMsg = phaseChecks.find((c) => c.status === 'fail')?.message

          return (
            <div key={phase} className="flex flex-1 items-start">
              <PhaseNode
                phase={phase}
                status={status}
                message={failMsg}
                index={i}
              />
              {i < RAIL_PHASES.length - 1 && (
                <div className="mt-5 flex-1 px-1">
                  <div
                    className={`h-px w-full ${
                      status === 'pass' || status === 'warn' || status === 'fail'
                        ? 'bg-border'
                        : 'border-t border-dashed border-text-dim/30'
                    }`}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
