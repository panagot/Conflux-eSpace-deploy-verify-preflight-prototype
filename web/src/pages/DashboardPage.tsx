import { ArrowsClockwise, Play } from '@phosphor-icons/react'
import { useDoctorContext } from '../context/DoctorContext'
import { firstFailMessage } from '../lib/checkPhases'
import { NetworkControl } from '../components/NetworkControl'
import { PayloadEditor } from '../components/PayloadEditor'
import { PreflightRail } from '../components/PreflightRail'
import { CheckStream } from '../components/CheckStream'
import { ReadyGate } from '../components/ReadyGate'
import { Skeleton } from '../components/Skeleton'
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

  const chainId = selected?.chainId ?? (network === 'mainnet' ? 1030 : 71)
  const pinnedFail = report && !report.ready ? firstFailMessage(report.checks) : null

  return (
    <>
      <div className="border-b border-border bg-surface-1/60 px-4 py-2 md:px-8">
        <p className="mx-auto max-w-[1400px] font-mono text-[11px] text-text-muted">
          <span className="text-text-dim">CFX-01 · Integration Grants</span>
          <span className="mx-2 text-border">|</span>
          eSpace preflight
          <span className="mx-2 text-border">|</span>
          chainId {chainId}
          <span className="mx-2 text-border">|</span>
          ConfluxScan lint
        </p>
      </div>

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
              Ctrl+Enter to run preflight
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
              <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
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
              <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
                {mode === 'payload' && report ? 'Payload lint' : 'Results stream'}
                <Tooltip
                  content={
                    <>
                      Actionable check output. Failures block deploy; warnings should be reviewed
                      before mainnet. See{' '}
                      <a
                        href={LINKS.confluxSkillsIssue}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent underline"
                      >
                        conflux-skills #5
                      </a>{' '}
                      for verify quirks.
                    </>
                  }
                />
              </h2>
              {report && (
                <div className="flex flex-wrap gap-3 font-mono text-[11px]">
                  <span className="text-pass">{report.summary.pass} pass</span>
                  <span className="text-warn">{report.summary.warn} warn</span>
                  <span className="text-fail">{report.summary.fail} fail</span>
                  <span className="text-skip">{report.summary.skip} skip</span>
                  <span className="text-text-dim">
                    {report.network} · {new Date(report.ranAt).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>

            {loading && <Skeleton />}

            {!loading && report && (
              <CheckStream checks={report.checks} pinnedFail={pinnedFail} />
            )}

            {!loading && !report && (
              <p className="text-sm text-text-muted">
                No preflight run yet. Select testnet and execute preflight, or use{' '}
                <code className="font-mono text-xs text-accent">npm run doctor:testnet</code> from
                the CLI.
              </p>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
