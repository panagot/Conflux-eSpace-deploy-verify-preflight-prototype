import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { CheckResult } from '../types'
import {
  RAIL_PHASES,
  getActivePhase,
  phaseStatus,
  checksForPhase,
  formatDuration,
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

const connectorColor: Record<string, string> = {
  idle: 'border-t border-dashed border-text-dim/30',
  active: 'bg-accent/50',
  pass: 'bg-pass/55',
  warn: 'bg-warn/55',
  fail: 'bg-fail/55',
}

const PHASE_HINT: Record<RailPhase, string> = {
  RPC: 'endpoint',
  Chain: 'chainId',
  Gas: 'fees',
  Explorer: 'scan API',
  Verify: 'payload',
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
    <div className="flex flex-1 flex-col items-center gap-1.5" title={message ?? PHASE_HINT[phase]}>
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
      <span
        className={`font-mono text-[10px] uppercase tracking-wider ${
          status === 'active' ? 'text-accent' : 'text-text-dim'
        }`}
      >
        {phase}
      </span>
      <span className="hidden text-[9px] text-text-dim sm:block">{PHASE_HINT[phase]}</span>
    </div>
  )
}

export function PreflightRail({ checks, loading, empty }: Props) {
  const [stagedIdx, setStagedIdx] = useState(0)

  useEffect(() => {
    if (!loading) {
      setStagedIdx(0)
      return
    }
    setStagedIdx(0)
    const t = window.setInterval(() => {
      setStagedIdx((i) => (i < RAIL_PHASES.length - 1 ? i + 1 : i))
    }, 650)
    return () => window.clearInterval(t)
  }, [loading])

  const activePhase = loading
    ? RAIL_PHASES[stagedIdx]
    : getActivePhase(checks, loading)

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
          No preflight run yet — pick a network and run preflight.
        </p>
        <p className="mt-1 text-center font-mono text-[10px] text-text-dim">
          RPC → Chain → Gas → Explorer → Verify
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-surface-1 px-4 py-6 md:px-8">
      <div className="flex items-start">
        {RAIL_PHASES.map((phase, i) => {
          let status = phaseStatus(phase, checks, loading, activePhase)
          // While loading with empty checks, mark prior stages as soft-pass (queued through)
          if (loading && checks.length === 0) {
            const idx = RAIL_PHASES.indexOf(phase)
            if (idx < stagedIdx) status = 'pass'
            else if (idx === stagedIdx) status = 'active'
            else status = 'idle'
          }

          const phaseChecks = checksForPhase(phase, checks)
          const fail = phaseChecks.find((c) => c.status === 'fail')
          const tip = fail
            ? `${fail.message}${fail.durationMs != null ? ` · ${formatDuration(fail.durationMs)}` : ''}`
            : undefined

          return (
            <div key={phase} className="flex flex-1 items-start">
              <PhaseNode phase={phase} status={status} message={tip} index={i} />
              {i < RAIL_PHASES.length - 1 && (
                <div className="mt-5 flex-1 px-1">
                  <div className={`h-px w-full ${connectorColor[status] ?? connectorColor.idle}`} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
