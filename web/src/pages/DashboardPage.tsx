import { ArrowsClockwise, Play, Wrench } from '@phosphor-icons/react'
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
    runFailDemo,
    applyConfluxScanFix,
  } = useDoctorContext()

  const pinnedFail = report && !report.ready ? firstFailMessage(report.checks) : null
  const chainId = selected?.chainId ?? (network === 'mainnet' ? 1030 : 71)
  const rpcLabel = (rpcUrl.trim() || selected?.defaultRpc || 'default RPC').replace(
    /^https?:\/\//,
    '',
  )

  const evmBlocked = Boolean(
    report &&
      !report.ready &&
      report.checks.some((c) => c.id === 'verify-evmversion' && c.status === 'fail'),
  )

  return (
    <>
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 lg:px-8">
        <div className="mb-6 rounded-lg border border-border bg-surface-1 px-4 py-4 md:px-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
            Conflux eSpace
          </p>
          <h1 className="mt-1 text-lg font-semibold tracking-tight text-text">
            Preflight before ConfluxScan verify
          </h1>
          <p className="mt-1.5 max-w-[68ch] text-sm text-text-muted">
            Live RPC + explorer probes on chain 71 / 1030. No wallet, no deploy, no custody. The
            sample JSON includes a known ConfluxScan reject so the first run shows BLOCKED.
          </p>
          <ol className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-text-dim">
            <li>1. Keep the sample</li>
            <li>2. Run preflight</li>
            <li>3. Apply the ConfluxScan fix</li>
            <li>4. See READY</li>
          </ol>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[38%_62%] lg:gap-8">
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
              onClick={runFailDemo}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-md border border-accent/40 bg-accent px-4 py-3 text-sm font-semibold text-surface-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              <Play size={16} weight="fill" />
              {loading && mode === 'doctor' && !report
                ? 'Running sample…'
                : 'Run sample preflight'}
            </button>
            <button
              type="button"
              onClick={runDoctor}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-md border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-muted transition-colors hover:text-text active:scale-[0.98] disabled:opacity-50"
            >
              {loading && mode === 'doctor' ? 'Running preflight…' : 'Re-run with current payload'}
            </button>
            {evmBlocked && (
              <button
                type="button"
                onClick={applyConfluxScanFix}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-md border border-pass/40 bg-pass/15 px-4 py-2.5 text-sm font-medium text-pass transition-colors hover:bg-pass/25 active:scale-[0.98] disabled:opacity-50"
              >
                <Wrench size={14} />
                Apply ConfluxScan fix and re-run
              </button>
            )}
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
              <p className="font-mono text-[10px] uppercase tracking-wider text-fail">
                Preflight failed
              </p>
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
                <RunMeta
                  report={report}
                  mode={mode}
                  chainId={chainId}
                  payloadRaw={includePayload ? payloadRaw : ''}
                />
                {report.ready && (
                  <div className="rounded-lg border border-pass/35 bg-pass/10 px-4 py-3.5">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-pass">
                      Next · ConfluxScan
                    </p>
                    <p className="mt-1.5 text-sm text-text-muted">
                      Environment is ready. Deploy with your own tooling, then submit verification
                      on ConfluxScan. VerifyFlow never broadcasts or holds keys.
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-3">
                      {selected?.explorer && (
                        <a
                          href={selected.explorer}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-[11px] text-accent hover:underline"
                        >
                          Open {report.network} explorer
                        </a>
                      )}
                      <a
                        href={LINKS.verifyContracts}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-[11px] text-accent hover:underline"
                      >
                        ConfluxScan verify docs
                      </a>
                    </div>
                  </div>
                )}
                <CheckStream
                  checks={report.checks}
                  pinnedFail={pinnedFail}
                  network={report.network}
                  ranAt={report.ranAt}
                  ready={report.ready}
                  summary={report.summary}
                  mode={mode}
                  onApplyFix={evmBlocked ? applyConfluxScanFix : undefined}
                />
              </div>
            )}

            {!loading && !report && (
              <div className="rounded-lg border border-border bg-surface-1/70 px-4 py-5">
                <p className="text-sm text-text">Run the sample to probe live eSpace</p>
                <p className="mt-1.5 max-w-[54ch] text-sm text-text-muted">
                  <strong className="text-text">Run sample preflight</strong> hits public Conflux RPC
                  and ConfluxScan. The sample includes{' '}
                  <code className="font-mono text-xs text-warn">evmVersion: &quot;default&quot;</code>
                  {' '}so Verify fails (
                  <a
                    href={LINKS.confluxSkillsIssue}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent underline"
                  >
                    conflux-skills #5
                  </a>
                  ). Then apply the one-click fix to see READY.
                </p>
              </div>
            )}
          </div>
        </section>
        </div>
      </main>
    </>
  )
}
