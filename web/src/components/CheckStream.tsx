import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle,
  WarningCircle,
  XCircle,
  MinusCircle,
  ArrowSquareOut,
  Lightbulb,
  Clock,
  CaretDown,
} from '@phosphor-icons/react'
import type { CheckResult } from '../types'
import {
  RAIL_PHASES,
  checksForPhase,
  formatDuration,
  phaseForCheckId,
  type RailPhase,
} from '../lib/checkPhases'
import { LINKS } from '../lib/links'

type Props = {
  checks: CheckResult[]
  pinnedFail?: string | null
  network?: string
  ranAt?: string
  ready?: boolean
  summary?: { pass: number; warn: number; fail: number; skip: number }
  mode?: 'doctor' | 'payload'
  onApplyFix?: () => void
}

const STATUS_META: Record<
  CheckResult['status'],
  { label: string; Icon: typeof CheckCircle; chip: string }
> = {
  pass: {
    label: 'PASS',
    Icon: CheckCircle,
    chip: 'border-pass/35 bg-pass/10 text-pass',
  },
  warn: {
    label: 'WARN',
    Icon: WarningCircle,
    chip: 'border-warn/35 bg-warn/10 text-warn',
  },
  fail: {
    label: 'FAIL',
    Icon: XCircle,
    chip: 'border-fail/40 bg-fail/10 text-fail',
  },
  skip: {
    label: 'SKIP',
    Icon: MinusCircle,
    chip: 'border-border bg-surface-2 text-text-dim',
  },
}

const PHASE_BLURB: Record<RailPhase, string> = {
  RPC: 'Endpoint health & latency',
  Chain: 'chainId must match selected network',
  Gas: 'Fee data for deploy estimation',
  Explorer: 'ConfluxScan verify API reachability',
  Verify: 'Payload fields ConfluxScan will accept',
}

function focusPayload() {
  document.getElementById('verify-payload')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function fixHint(check: CheckResult): string | null {
  if (check.status !== 'fail' && check.status !== 'warn') return null
  if (check.id === 'verify-evmversion') {
    return 'Remove "evmVersion": "default" from the payload (or set a concrete version like paris / cancun), then re-run preflight.'
  }
  if (check.id === 'verify-compiler') {
    return 'Set compilerVersion to the exact solc string used for your artifacts (e.g. v0.8.24+commit…).'
  }
  if (check.id === 'rpc-reachability' || check.id === 'rpc-chain-id') {
    return 'Switch network or set Advanced RPC override to an endpoint that reports the expected chainId.'
  }
  if (check.id === 'explorer-api') {
    return 'Retry shortly, or confirm ConfluxScan is up for this network.'
  }
  if (check.id === 'gas-estimate') {
    return 'Confirm the RPC returns eth_gasPrice; try an alternate public RPC.'
  }
  return check.detail ?? null
}

function MetaTable({ meta }: { meta: Record<string, string | number | boolean | null> }) {
  const rows = Object.entries(meta)
  if (!rows.length) return null
  return (
    <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded border border-border/70 bg-surface-0/40 px-2.5 py-2 font-mono text-[10px]">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-text-dim">{k}</dt>
          <dd className="truncate text-text">{String(v)}</dd>
        </div>
      ))}
    </dl>
  )
}

function CheckCard({
  check,
  index,
  onFocusPayload,
  onApplyFix,
}: {
  check: CheckResult
  index: number
  onFocusPayload?: () => void
  onApplyFix?: () => void
}) {
  const meta = STATUS_META[check.status]
  const Icon = meta.Icon
  const hint = fixHint(check)
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isHot = check.status === 'fail' || check.status === 'warn'
  const payloadFix =
    check.id.startsWith('verify-') && (check.status === 'fail' || check.status === 'warn')

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.04, duration: 0.22 }}
      className={`rounded-lg border px-3.5 py-3 ${
        check.status === 'fail'
          ? 'border-fail/40 bg-fail/[0.07]'
          : check.status === 'warn'
            ? 'border-warn/30 bg-warn/[0.05]'
            : 'border-border/80 bg-surface-1/80'
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon
          size={18}
          weight={isHot ? 'fill' : 'duotone'}
          className={`mt-0.5 shrink-0 ${
            check.status === 'pass'
              ? 'text-pass'
              : check.status === 'warn'
                ? 'text-warn'
                : check.status === 'fail'
                  ? 'text-fail'
                  : 'text-text-dim'
          }`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-text">{check.name}</h4>
            <span
              className={`rounded border px-1.5 py-0.5 font-mono text-[10px] tracking-wide ${meta.chip}`}
            >
              {meta.label}
            </span>
            {check.id === 'verify-bytecode-tip' ? (
              <span className="font-mono text-[10px] text-text-dim">manual check (post-deploy)</span>
            ) : (
              <span className="font-mono text-[10px] text-text-dim">{check.id}</span>
            )}
            {check.durationMs != null && (
              <span className="ml-auto inline-flex items-center gap-1 font-mono text-[11px] tabular-nums text-text-dim">
                <Clock size={11} />
                {formatDuration(check.durationMs)}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-text-muted">{check.message}</p>
          {check.detail && (
            <p className="mt-1.5 font-mono text-[11px] leading-relaxed text-text-dim">
              {check.detail}
            </p>
          )}
          {check.meta && <MetaTable meta={check.meta} />}
          {hint && isHot && (
            <div className="mt-2.5 flex gap-2 rounded-md border border-border/70 bg-surface-0/50 px-2.5 py-2">
              <Lightbulb size={14} className="mt-0.5 shrink-0 text-accent" weight="fill" />
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-wider text-accent">Fix</p>
                <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{hint}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  {check.id === 'verify-evmversion' && onApplyFix && (
                    <button
                      type="button"
                      onClick={onApplyFix}
                      className="font-mono text-[11px] text-pass hover:underline"
                    >
                      Apply ConfluxScan fix and re-run
                    </button>
                  )}
                  {payloadFix && onFocusPayload && (
                    <button
                      type="button"
                      onClick={onFocusPayload}
                      className="font-mono text-[11px] text-accent hover:underline"
                    >
                      Open payload editor
                    </button>
                  )}
                  {check.id === 'verify-evmversion' && (
                    <a
                      href={LINKS.confluxSkillsIssue}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-accent hover:underline"
                    >
                      conflux-skills #5 <ArrowSquareOut size={11} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  )
}

function PhaseBlock({
  phase,
  checks,
  startIndex,
  defaultCollapsed,
  onFocusPayload,
  onApplyFix,
}: {
  phase: RailPhase
  checks: CheckResult[]
  startIndex: number
  defaultCollapsed: boolean
  onFocusPayload?: () => void
  onApplyFix?: () => void
}) {
  const [open, setOpen] = useState(!defaultCollapsed)
  if (checks.length === 0) return null

  const worst = checks.some((c) => c.status === 'fail')
    ? 'fail'
    : checks.some((c) => c.status === 'warn')
      ? 'warn'
      : checks.every((c) => c.status === 'skip')
        ? 'skip'
        : 'pass'
  const elapsed = checks.reduce((s, c) => s + (c.durationMs ?? 0), 0)

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 text-left"
      >
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            worst === 'fail'
              ? 'bg-fail'
              : worst === 'warn'
                ? 'bg-warn'
                : worst === 'skip'
                  ? 'bg-skip'
                  : 'bg-pass'
          }`}
        />
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-text">
            {phase}
          </h3>
          <span
            className={`rounded border px-1 py-px font-mono text-[9px] uppercase ${STATUS_META[worst].chip}`}
          >
            {STATUS_META[worst].label}
          </span>
          <span className="truncate text-[11px] text-text-dim">{PHASE_BLURB[phase]}</span>
        </div>
        <span className="font-mono text-[10px] text-text-dim">
          {checks.length} · {elapsed > 0 ? formatDuration(elapsed) : '—'}
        </span>
        <CaretDown
          size={12}
          className={`shrink-0 text-text-dim transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="space-y-2 pl-1">
          {checks.map((c, i) => (
            <CheckCard
              key={`${c.id}-${i}`}
              check={c}
              index={startIndex + i}
              onFocusPayload={onFocusPayload}
              onApplyFix={onApplyFix}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CheckStream({
  checks,
  pinnedFail,
  network,
  ranAt,
  ready,
  summary,
  mode = 'doctor',
  onApplyFix,
}: Props) {
  let idx = 0
  const total = summary
    ? summary.pass + summary.warn + summary.fail + summary.skip
    : checks.length
  const failCheck = checks.find((c) => c.status === 'fail')
  const hasFail = Boolean(summary?.fail || failCheck)
  const failPhase = failCheck ? phaseForCheckId(failCheck.id) : null
  const wall = checks.reduce((s, c) => s + (c.durationMs ?? 0), 0)

  return (
    <div className="space-y-5">
      {summary && total > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-surface-1">
          <div className="flex h-1.5 w-full">
            {summary.pass > 0 && (
              <div className="bg-pass" style={{ width: `${(summary.pass / total) * 100}%` }} />
            )}
            {summary.warn > 0 && (
              <div className="bg-warn" style={{ width: `${(summary.warn / total) * 100}%` }} />
            )}
            {summary.fail > 0 && (
              <div className="bg-fail" style={{ width: `${(summary.fail / total) * 100}%` }} />
            )}
            {summary.skip > 0 && (
              <div className="bg-skip" style={{ width: `${(summary.skip / total) * 100}%` }} />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 py-2.5 font-mono text-[11px]">
            <span className="text-pass">{summary.pass} pass</span>
            <span className="text-warn">{summary.warn} warn</span>
            <span className="text-fail">{summary.fail} fail</span>
            <span className="text-skip">{summary.skip} skip</span>
            {ready != null && (
              <span className={ready ? 'text-pass' : 'text-fail'}>
                {ready ? 'gate open' : 'gate closed'}
              </span>
            )}
            {wall > 0 && <span className="text-text-dim">{formatDuration(wall)} probes</span>}
            {(network || ranAt) && (
              <span className="ml-auto text-text-dim">
                {network}
                {network && ranAt ? ' · ' : ''}
                {ranAt ? new Date(ranAt).toLocaleTimeString() : ''}
              </span>
            )}
          </div>
        </div>
      )}

      {pinnedFail && failCheck && (
        <div className="rounded-lg border border-fail/45 bg-gradient-to-br from-fail/15 to-fail/5 px-4 py-3.5">
          <div className="flex items-start gap-3">
            <XCircle size={22} weight="fill" className="mt-0.5 shrink-0 text-fail" />
            <div className="min-w-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-fail">
                Blocked · gate closed
              </p>
              <p className="mt-1 font-mono text-[10px] text-text-dim">
                {failCheck.id}
                {failPhase ? ` · phase ${failPhase}` : ''}
              </p>
              <p className="mt-1 text-sm font-medium text-text">{failCheck.name}</p>
              <p className="mt-0.5 text-sm text-text-muted">{failCheck.message}</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {failCheck.id === 'verify-evmversion' && onApplyFix && (
                  <button
                    type="button"
                    onClick={onApplyFix}
                    className="font-mono text-[11px] text-pass hover:underline"
                  >
                    Apply ConfluxScan fix and re-run
                  </button>
                )}
                {failCheck.id.startsWith('verify-') && (
                  <button
                    type="button"
                    onClick={focusPayload}
                    className="font-mono text-[11px] text-accent hover:underline"
                  >
                    Open payload editor
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-dim">
        {total} checks · {mode === 'payload' ? 'lint only' : 'full preflight'}
        {hasFail ? ' · passing phases collapsed' : ''}
      </p>

      <div className="space-y-6">
        {RAIL_PHASES.map((phase) => {
          let phaseChecks =
            phase === 'RPC'
              ? checks.filter((c) => c.id === 'rpc-reachability')
              : phase === 'Chain'
                ? checks.filter((c) => c.id === 'rpc-chain-id')
                : checksForPhase(phase, checks)

          if (phase === 'Chain' && phaseChecks.length === 0) {
            const rpc = checks.find((c) => c.id === 'rpc-reachability' && c.status !== 'fail')
            if (rpc?.meta?.chainId != null) {
              phaseChecks = [
                {
                  id: 'rpc-chain-id',
                  name: 'RPC chain ID',
                  status: 'pass',
                  message: `chainId ${rpc.meta.chainId} matches selected network`,
                  detail: 'Aligned with Fluent / MetaMask / Hardhat eSpace target.',
                  meta: {
                    chainId: rpc.meta.chainId,
                    expectedChainId: rpc.meta.chainId,
                  },
                },
              ]
            }
          }

          const start = idx
          idx += phaseChecks.length
          const phaseHot = phaseChecks.some((c) => c.status === 'fail' || c.status === 'warn')
          return (
            <PhaseBlock
              key={phase}
              phase={phase}
              checks={phaseChecks}
              startIndex={start}
              defaultCollapsed={hasFail && !phaseHot}
              onFocusPayload={focusPayload}
              onApplyFix={onApplyFix}
            />
          )
        })}
      </div>
    </div>
  )
}
