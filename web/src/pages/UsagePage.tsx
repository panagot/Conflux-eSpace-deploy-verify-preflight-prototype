import { Link } from 'react-router-dom'
import {
  Terminal,
  Code,
  Globe,
  Keyboard,
  ArrowRight,
  Plugs,
  TreeStructure,
  GasPump,
  MagnifyingGlass,
  FileCode,
  CheckCircle,
  WarningCircle,
} from '@phosphor-icons/react'
import { LINKS } from '../lib/links'

const CHECKS = [
  {
    icon: Plugs,
    title: 'RPC reachability',
    detail: 'Block number, latency, endpoint health',
  },
  {
    icon: TreeStructure,
    title: 'Chain ID',
    detail: '71 testnet · 1030 mainnet',
  },
  {
    icon: GasPump,
    title: 'Gas / fee data',
    detail: 'gasPrice available for estimation',
  },
  {
    icon: MagnifyingGlass,
    title: 'ConfluxScan API',
    detail: 'Explorer API reachable (stats probe)',
  },
  {
    icon: FileCode,
    title: 'Verify payload lint',
    detail: 'Compiler, optimizer, evmVersion quirks',
  },
]

const RAIL: { id: string; blurb: string; example: 'pass' | 'fail' }[] = [
  { id: 'RPC', blurb: 'Endpoint responds; latency noted', example: 'pass' },
  { id: 'Chain', blurb: 'chainId 71 or 1030 matches', example: 'pass' },
  { id: 'Gas', blurb: 'gasPrice / fee data readable', example: 'pass' },
  { id: 'Explorer', blurb: 'ConfluxScan API reachable', example: 'pass' },
  { id: 'Verify', blurb: 'Payload fields ConfluxScan accepts', example: 'fail' },
]

const WORKFLOW = [
  'Select network (71 / 1030)',
  'Confirm RPC or set Advanced override',
  'Paste ConfluxScan verify fields',
  'Run preflight — fix BLOCKED first',
  'Deploy with Hardhat / Foundry / Remix',
  'Submit verification on ConfluxScan',
]

function RailGraphic() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface-1">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 20% 0%, oklch(0.72 0.14 175 / 0.18), transparent 55%), radial-gradient(ellipse 60% 50% at 90% 100%, oklch(0.62 0.12 230 / 0.12), transparent 50%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(oklch(0.72 0.14 175 / 0.35) 1px, transparent 1px), linear-gradient(90deg, oklch(0.72 0.14 175 / 0.35) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="relative grid gap-8 px-5 py-6 md:px-8 md:py-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
            How a preflight run reads
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-text md:text-2xl">
            Five gates. One Ready / Blocked answer.
          </h2>
          <p className="mt-2 max-w-[48ch] text-sm text-text-muted">
            Same rail as the dashboard — left to right — so reviewers and CI see the same story.
          </p>

          <div className="mt-7 flex w-full items-start justify-between gap-1">
            {RAIL.map((phase, i) => {
              const fail = phase.example === 'fail'
              return (
                <div key={phase.id} className="flex min-w-0 flex-1 flex-col items-center">
                  <div className="flex w-full items-center">
                    {i > 0 && (
                      <div
                        className={`mb-0 h-px flex-1 ${fail ? 'bg-fail/40' : 'bg-pass/45'}`}
                        aria-hidden
                      />
                    )}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-mono text-[10px] font-medium ${
                        fail
                          ? 'border-fail/70 bg-fail/10 text-fail'
                          : 'border-pass/70 bg-pass/10 text-pass'
                      }`}
                    >
                      {fail ? '×' : '✓'}
                    </div>
                    {i < RAIL.length - 1 && (
                      <div className="h-px flex-1 bg-pass/45" aria-hidden />
                    )}
                  </div>
                  <span className="mt-2 font-mono text-[10px] uppercase tracking-wider text-text">
                    {phase.id}
                  </span>
                  <span className="mt-1 hidden text-center text-[10px] leading-snug text-text-dim sm:block">
                    {phase.blurb}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <aside className="flex flex-col justify-between gap-4 rounded-lg border border-border/80 bg-surface-0/55 p-4 md:p-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-dim">
              Gate outcomes
            </p>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex gap-2.5">
                <CheckCircle size={16} className="mt-0.5 shrink-0 text-pass" weight="fill" />
                <div>
                  <p className="font-medium text-text">READY</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
                    All gates pass (warnings allowed). Safe to deploy, then verify on ConfluxScan.
                  </p>
                </div>
              </li>
              <li className="flex gap-2.5">
                <WarningCircle size={16} className="mt-0.5 shrink-0 text-fail" weight="fill" />
                <div>
                  <p className="font-medium text-text">BLOCKED</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-text-muted">
                    A gate failed — fix before mainnet. Common Verify fail:{' '}
                    <code className="font-mono text-[11px] text-warn">evmVersion: &quot;default&quot;</code>{' '}
                    (
                    <a
                      href={LINKS.confluxSkillsIssue}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline"
                    >
                      #5
                    </a>
                    ).
                  </p>
                </div>
              </li>
            </ul>
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-xs leading-relaxed text-text-dim">
              Lint-only skips RPC/explorer and checks payload fields offline. Full doctor hits public
              RPC + ConfluxScan.
            </p>
            <Link
              to="/"
              className="mt-3 inline-flex items-center gap-1 text-xs text-accent hover:underline"
            >
              Run it on the dashboard <ArrowRight size={12} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}

export function UsagePage() {
  return (
    <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-10 md:px-8">
      <header className="mb-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
            Documentation
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text">Usage guide</h1>
          <p className="mt-3 max-w-[58ch] text-sm leading-relaxed text-text-muted">
            Validate Conflux eSpace RPC, chainId, and ConfluxScan verify fields <em>before</em> you
            deploy. Does not deploy contracts or submit ConfluxScan verification — you keep your own
            tooling. eSpace only (chainId 71 / 1030, hex addresses); not Core Space / CIP-37. Wire{' '}
            <code className="font-mono text-xs text-accent">/api/doctor</code> into CI. CLI
            packaging is the remaining M0 item; Hardhat plugin is M1.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm text-accent transition-colors hover:bg-accent/20"
          >
            Open dashboard
            <ArrowRight size={14} />
          </Link>
          <a
            href={LINKS.confluxSkillsIssue}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface-1 px-3 py-2 text-sm text-text-muted transition-colors hover:text-text"
          >
            conflux-skills #5
          </a>
        </div>
      </header>

      <RailGraphic />

      {/* What gets checked */}
      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-text">What gets checked</h2>
            <p className="mt-1 text-sm text-text-muted">Every doctor run covers these five surfaces.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {CHECKS.map((c, i) => (
            <div
              key={c.title}
              className="relative overflow-hidden rounded-lg border border-border bg-surface-1 p-4"
            >
              <span className="font-mono text-[10px] text-text-dim">0{i + 1}</span>
              <c.icon size={22} className="mt-2 text-accent" weight="duotone" />
              <p className="mt-3 text-sm font-medium text-text">{c.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-text-muted">{c.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Paths */}
      <section className="mt-12">
        <h2 className="text-lg font-semibold text-text">How to use it</h2>
        <p className="mt-1 text-sm text-text-muted">Three surfaces — same engine underneath.</p>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {/* Dashboard */}
          <article className="flex flex-col rounded-xl border border-border bg-surface-1">
            <div className="border-b border-border px-5 py-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-accent/30 bg-accent/10 text-accent">
                    <Globe size={16} weight="duotone" />
                  </span>
                  <h3 className="text-sm font-semibold text-text">Web dashboard</h3>
                </div>
                <span className="rounded border border-pass/40 bg-pass/10 px-1.5 py-0.5 font-mono text-[10px] text-pass">
                  LIVE
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-text-muted">
                Best for reviewers: Monaco payload editor + Ready/Blocked gate.
              </p>
            </div>
            <div className="flex flex-1 flex-col px-5 py-4">
              <ol className="space-y-2 text-xs text-text-muted">
                <li className="flex gap-2">
                  <span className="font-mono text-accent">1</span>
                  Open Dashboard → Run preflight
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-accent">2</span>
                  Read the rail + results stream
                </li>
                <li className="flex gap-2">
                  <span className="font-mono text-accent">3</span>
                  Fix BLOCKED fields, then re-run
                </li>
              </ol>
              <Link
                to="/"
                className="mt-4 inline-flex items-center gap-1 text-xs text-accent hover:underline"
              >
                Open dashboard <ArrowRight size={12} />
              </Link>
            </div>
          </article>

          {/* API */}
          <article className="flex flex-col rounded-xl border border-border bg-surface-1">
            <div className="border-b border-border px-5 py-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-accent/30 bg-accent/10 text-accent">
                    <Code size={16} weight="duotone" />
                  </span>
                  <h3 className="text-sm font-semibold text-text">REST API</h3>
                </div>
                <span className="rounded border border-pass/40 bg-pass/10 px-1.5 py-0.5 font-mono text-[10px] text-pass">
                  LIVE
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-text-muted">
                Embed in CI — public RPC + ConfluxScan only. No keys.
              </p>
            </div>
            <pre className="flex-1 overflow-x-auto px-5 py-4 font-mono text-[11px] leading-relaxed text-text-muted">
{`# Live origin (expect ready:false on sample)
curl -s -X POST \\
  https://conflux-e-space-deploy-verify-prefl-gamma.vercel.app/api/doctor \\
  -H "Content-Type: application/json" \\
  -d '{"network":"testnet","verifyPayload":{"compilerVersion":"v0.8.24+commit.e11b9ed9","optimizationUsed":true,"runs":200,"contractName":"MyToken","evmVersion":"default"}}'

POST /api/lint-payload
{ "raw": "{…}" }`}
            </pre>
          </article>

          {/* CLI */}
          <article className="flex flex-col rounded-xl border border-dashed border-border bg-surface-1/70">
            <div className="border-b border-border px-5 py-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-surface-2 text-text-muted">
                    <Terminal size={16} weight="duotone" />
                  </span>
                  <h3 className="text-sm font-semibold text-text">CLI</h3>
                </div>
                <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-text-dim">
                  M0
                </span>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-text-muted">
                Exit-code gate for terminals. Packaging is the remaining M0 item.
              </p>
            </div>
            <pre className="flex-1 overflow-x-auto px-5 py-4 font-mono text-[11px] leading-relaxed text-text-dim">
{`# After M0 packaging
verifyflow doctor --network testnet
verifyflow doctor --network mainnet \\
  --payload ./verify.json

# exit 1 = any check failed`}
            </pre>
          </article>
        </div>
      </section>

      {/* Workflow + trap */}
      <section className="mt-12 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border border-border bg-surface-1 p-5 md:p-6">
          <div className="flex items-center gap-2">
            <Keyboard size={18} className="text-accent" weight="duotone" />
            <h2 className="text-sm font-semibold text-text">Recommended deploy workflow</h2>
          </div>
          <p className="mt-1 text-xs text-text-muted">Before every eSpace mainnet push.</p>
          <ol className="mt-5 space-y-3">
            {WORKFLOW.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent/35 bg-accent/10 font-mono text-[10px] text-accent">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-sm text-text-muted">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-warn/35 bg-warn/5 p-5 md:p-6">
            <div className="flex items-center gap-2">
              <WarningCircle size={18} className="text-warn" weight="fill" />
              <h2 className="text-sm font-semibold text-warn">Known verify trap</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-text-muted">
              ConfluxScan rejects{' '}
              <code className="font-mono text-warn">evmVersion: &quot;default&quot;</code>. Omit the
              field for compiler defaults. The dashboard sample includes it on purpose so you can
              see BLOCKED.
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-warn hover:underline"
            >
              Reproduce on Dashboard <ArrowRight size={12} />
            </Link>
          </div>

          <div className="rounded-xl border border-border bg-surface-1 p-5 md:p-6">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-pass" weight="duotone" />
              <h2 className="text-sm font-semibold text-text">Default RPC endpoints</h2>
            </div>
            <table className="mt-4 w-full text-left text-sm">
              <thead>
                <tr className="font-mono text-[10px] uppercase tracking-wider text-text-dim">
                  <th className="pb-2 pr-3 font-normal">Network</th>
                  <th className="pb-2 pr-3 font-normal">ID</th>
                  <th className="pb-2 font-normal">RPC</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[11px] text-text-muted">
                <tr className="border-t border-border/60">
                  <td className="py-2.5 pr-3">Testnet</td>
                  <td className="py-2.5 pr-3 text-accent">71</td>
                  <td className="py-2.5 break-all">evmtestnet.confluxrpc.com</td>
                </tr>
                <tr className="border-t border-border/60">
                  <td className="py-2.5 pr-3">Mainnet</td>
                  <td className="py-2.5 pr-3 text-accent">1030</td>
                  <td className="py-2.5 break-all">evm.confluxrpc.com</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-3 text-xs text-text-dim">
              <a
                href={LINKS.rpcProviders}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                RPC providers
              </a>
              {' · '}
              <a
                href={LINKS.espaceDeveloperQuickstart}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                developer quickstart
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
