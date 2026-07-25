import { useEffect, useState } from 'react'
import { CircleNotch, Plugs, TreeStructure, GasPump, MagnifyingGlass, FileCode } from '@phosphor-icons/react'
import { RAIL_PHASES, type RailPhase } from '../lib/checkPhases'

type Props = {
  mode: 'doctor' | 'payload'
  network: string
  chainId: number
  rpcLabel: string
  includePayload: boolean
}

const PHASE_COPY: Record<
  RailPhase,
  { Icon: typeof Plugs; title: string; detail: string }
> = {
  RPC: {
    Icon: Plugs,
    title: 'Probing RPC',
    detail: 'eth_blockNumber · net_version · latency',
  },
  Chain: {
    Icon: TreeStructure,
    title: 'Confirming chainId',
    detail: 'Must match selected eSpace network',
  },
  Gas: {
    Icon: GasPump,
    title: 'Reading fee data',
    detail: 'gasPrice for deploy estimation',
  },
  Explorer: {
    Icon: MagnifyingGlass,
    title: 'Hitting ConfluxScan',
    detail: 'Verify API reachability',
  },
  Verify: {
    Icon: FileCode,
    title: 'Linting verify payload',
    detail: 'compiler · optimizer · evmVersion',
  },
}

/** Progressive instrument panel while /api/doctor is in flight. */
export function RunActivity({ mode, network, chainId, rpcLabel, includePayload }: Props) {
  const [elapsed, setElapsed] = useState(0)
  const [phaseIdx, setPhaseIdx] = useState(0)

  const phases =
    mode === 'payload' ? (['Verify'] as RailPhase[]) : [...RAIL_PHASES]

  useEffect(() => {
    setElapsed(0)
    setPhaseIdx(0)
    const tick = window.setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => window.clearInterval(tick)
  }, [mode, network])

  useEffect(() => {
    if (phases.length <= 1) return
    const step = window.setInterval(() => {
      setPhaseIdx((i) => (i < phases.length - 1 ? i + 1 : i))
    }, 700)
    return () => window.clearInterval(step)
  }, [phases.length, mode, network])

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CircleNotch size={16} className="animate-spin text-accent" />
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
              {mode === 'payload' ? 'Lint in progress' : 'Preflight in progress'}
            </p>
          </div>
          <span className="font-mono text-[11px] tabular-nums text-text-dim">
            {elapsed}s elapsed
          </span>
        </div>
        <div className="mt-3 grid gap-2 font-mono text-[11px] text-text-muted sm:grid-cols-2">
          <p>
            <span className="text-text-dim">network</span>{' '}
            <span className="text-text">{network}</span>
            <span className="text-text-dim"> · </span>
            <span className="text-accent">chainId {chainId}</span>
          </p>
          <p className="truncate">
            <span className="text-text-dim">rpc</span>{' '}
            <span className="text-text">{rpcLabel}</span>
          </p>
          <p>
            <span className="text-text-dim">payload</span>{' '}
            <span className="text-text">{includePayload ? 'included' : 'skipped'}</span>
          </p>
          <p>
            <span className="text-text-dim">mode</span>{' '}
            <span className="text-text">{mode === 'payload' ? 'lint-only' : 'full doctor'}</span>
          </p>
        </div>
      </div>

      <ol className="space-y-2">
        {phases.map((phase, i) => {
          const meta = PHASE_COPY[phase]
          const Icon = meta.Icon
          const done = i < phaseIdx
          const current = i === phaseIdx
          return (
            <li
              key={phase}
              className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${
                current
                  ? 'border-accent/40 bg-accent/8'
                  : done
                    ? 'border-border/60 bg-surface-1/60'
                    : 'border-border/40 bg-surface-1/30 opacity-55'
              }`}
            >
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] ${
                  current
                    ? 'border-accent text-accent'
                    : done
                      ? 'border-pass/50 text-pass'
                      : 'border-border text-text-dim'
                }`}
              >
                {done ? '✓' : current ? <CircleNotch size={12} className="animate-spin" /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Icon size={14} className={current ? 'text-accent' : 'text-text-dim'} weight="duotone" />
                  <p className="text-sm font-medium text-text">{meta.title}</p>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-text-dim">
                    {phase}
                  </span>
                </div>
                <p className="mt-0.5 font-mono text-[11px] text-text-dim">{meta.detail}</p>
              </div>
              {current && (
                <span className="shrink-0 font-mono text-[10px] text-accent">active</span>
              )}
            </li>
          )
        })}
      </ol>

      <p className="text-center font-mono text-[10px] text-text-dim">
        Waiting on public RPC + ConfluxScan · typically 1–3s
      </p>
    </div>
  )
}
