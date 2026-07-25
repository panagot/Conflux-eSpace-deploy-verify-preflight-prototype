import { ArrowsClockwise, Play } from '@phosphor-icons/react'
import { useDoctorContext } from '../context/DoctorContext'
import { firstFailMessage } from '../lib/checkPhases'
import { NetworkControl } from '../components/NetworkControl'
import { PayloadEditor } from '../components/PayloadEditor'
import { PreflightRail } from '../components/PreflightRail'
import { CheckStream } from '../components/CheckStream'
import { ReadyGate } from '../components/ReadyGate'
import { RunActivity } from '../components/RunActivity'
import { RunMeta } from '../components/RunMeta'
import { Tooltip } from '../components/Tooltip'
import { LINKS } from '../lib/links'

export function DashboardPage() {
  const {
    networks,
    network,
    setNetwork,
    rpcUrl,
    setRpcUrl,
    payloadRaw,
    setPayloadRaw,
    includePayload,
    setIncludePayload,
    report,
    loading,
    error,
    mode,
    jsonError,
    selected,
    runDoctor,
    lintOnly,
  } = useDoctorContext()

  const pinnedFail = report && !report.ready ? firstFailMessage(report.checks) : null
  const chainId = selected?.chainId ?? (network === 'mainnet' ? 1030 : 71)
  const rpcLabel = (rpcUrl.trim() || selected?.defaultRpc || 'default RPC').replace(
    /^https?:\/\//,
    '',
  )

  return (
    <>
      <main className="mx-auto grid w-full max-w-[1400px] flex-1 grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[38%_62%] lg:gap-8 lg:px-8">
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <NetworkControl
            networks={networks}
            network={network}
            onNetworkChange={setNetwork}
            rpcUrl={rpcUrl}
            onRpcChange={setRpcUrl}
            selected={selected}
          />

          <PayloadEditor
            value={payloadRaw}
            onChange={setPayloadRaw}
            jsonError={jsonError}
            includePayload={includePayload}
            onIncludeChange={setIncludePayload}
          />

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={runDoctor}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-md border border-accent/40 bg-accent px-4 py-3 text-sm font-semibold text-surface-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              <Play size={16} weight="fill" />
              {loading && mode === 'doctor' ? 'Running preflight…' : 'Run preflight'}
            </button>
            <button
              type="button"
              onClick={lintOnly}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-md border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-muted transition-colors hover:text-text active:scale-[0.98] disabled:opacity-50"
            >
              <ArrowsClockwise size={14} />
              {loading && mode === 'payload' ? 'Linting…' : 'Lint payload only'}
            </button>
            <p className="text-center font-mono text-[10px] text-text-dim">
              Ctrl+Enter = full preflight
            </p>
          </div>

          {error && (
            <div className="rounded border border-fail/40 bg-fail/10 px-3 py-2">
              <p className="font-mono text-[10px] uppercase tracking-wider text-fail">ERR_PREFLIGHT</p>
              <p className="mt-1 text-xs text-text-muted">{error}</p>
            </div>
          )}
        </aside>

        <section className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-dim">
                Preflight before ConfluxScan verify
              </p>
              <h2 className="mt-1 flex items-center gap-2 text-sm font-semibold text-text">
                Preflight rail
                <Tooltip content="Checks run left-to-right: RPC reachability, chain ID, gas data, ConfluxScan API, then verify-payload lint." />
              </h2>
              <p className="mt-0.5 text-xs text-text-muted">
                RPC → Chain → Gas → Explorer → Verify
              </p>
            </div>
            <ReadyGate report={report} loading={loading} />
          </div>

          <PreflightRail
            checks={report?.checks ?? []}
            loading={loading}
            empty={!report && !loading}
          />

          <div className="border-t border-border pt-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.12em] text-text">
                {mode === 'payload' && report ? 'Lint log' : 'Preflight log'}
                <Tooltip
                  content={
                    <>
                      Probe output. Failures block deploy; warnings should be reviewed before
                      mainnet. See{' '}
                      <a
                        href={LINKS.confluxSkillsIssue}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent underline"
                      >
                        conflux-skills #5
                      </a>
                      .
                    </>
                  }
                />
              </h2>
            </div>

            {loading && (
              <RunActivity
                mode={mode}
                network={network}
                chainId={chainId}
                rpcLabel={rpcLabel}
                includePayload={includePayload}
              />
            )}

            {!loading && report && (
              <div className="space-y-4">
                <RunMeta report={report} mode={mode} chainId={chainId} />
                <CheckStream
                  checks={report.checks}
                  pinnedFail={pinnedFail}
                  network={report.network}
                  ranAt={report.ranAt}
                  ready={report.ready}
                  summary={report.summary}
                  mode={mode}
                />
              </div>
            )}

            {!loading && !report && (
              <div className="rounded-lg border border-dashed border-border bg-surface-1/70 px-4 py-5">
                <p className="text-sm text-text">Waiting for first preflight</p>
                <p className="mt-1.5 max-w-[52ch] text-sm text-text-muted">
                  Pick a network, keep or edit the verify payload, then{' '}
                  <strong className="text-text">Run preflight</strong>. The sample JSON includes{' '}
                  <code className="font-mono text-xs text-warn">evmVersion: &quot;default&quot;</code>{' '}
                  so you can see a ConfluxScan reject (
                  <a
                    href={LINKS.confluxSkillsIssue}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent underline"
                  >
                    conflux-skills #5
                  </a>
                  ).
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
