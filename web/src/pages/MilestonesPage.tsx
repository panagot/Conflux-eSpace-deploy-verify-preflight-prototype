import { GRANT, MILESTONES } from '../lib/milestones'
import { LINKS } from '../lib/links'

const statusLabel = {
  complete: { text: 'Delivered', class: 'text-pass border-pass/40 bg-pass/10' },
  current: { text: 'In progress', class: 'text-accent border-accent/40 bg-accent/10' },
  planned: { text: 'Planned', class: 'text-text-dim border-border bg-surface-2' },
}

export function MilestonesPage() {
  return (
    <main className="mx-auto max-w-[1000px] flex-1 px-4 py-10 md:px-8">
      <header className="mb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
          Conflux Integration Grants · CFX-01
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text">
          Milestones &amp; funding
        </h1>
        <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-text-muted">
          Total ask: <strong className="text-text">${GRANT.totalAsk.toLocaleString()}</strong> paid in
          CFX across three equal tranches. Each milestone unlocks the next payment on verified
          delivery. Public MIT repo and npm packages ship at funded kickoff; M2 closes with the
          official site and 12 months of maintenance.
        </p>
      </header>

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface-1 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-dim">Total ask</p>
          <p className="mt-1 font-mono text-2xl text-accent">${GRANT.totalAsk.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-1 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-dim">Per milestone</p>
          <p className="mt-1 font-mono text-2xl text-text">$1,000 × 3</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-1 p-4">
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-dim">Post-grant</p>
          <p className="mt-1 text-sm text-text-muted">12 months maintenance · public MIT repo · official site</p>
        </div>
      </div>

      <div className="space-y-6">
        {MILESTONES.map((m) => {
          const st = statusLabel[m.status]
          return (
            <article
              key={m.id}
              className="rounded-lg border border-border bg-surface-1 p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-semibold text-accent">{m.id}</span>
                    <span className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${st.class}`}>
                      {st.text}
                    </span>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-text">{m.title}</h2>
                  <p className="mt-1 font-mono text-sm text-warn">${m.payout.toLocaleString()} on delivery</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-text-muted">{m.summary}</p>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-wider text-text-dim">
                    Deliverables
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-text-muted">
                    {m.deliverables.map((d) => (
                      <li key={d} className="flex gap-2">
                        <span className="text-accent">·</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-mono text-[10px] uppercase tracking-wider text-text-dim">
                    Acceptance KPIs
                  </h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-text-muted">
                    {m.kpi.map((k) => (
                      <li key={k} className="flex gap-2">
                        <span className="text-pass">✓</span>
                        {k}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div className="mt-10 rounded-lg border border-accent/30 bg-accent/5 p-6">
        <h2 className="text-sm font-semibold text-text">Payment schedule</h2>
        <ol className="mt-4 space-y-3 text-sm text-text-muted">
          <li>
            <strong className="font-mono text-accent">$1,000</strong> — Grant approval / M0 delivery
            (live demo + API + dashboard now; CLI packaging to complete the tranche)
          </li>
          <li>
            <strong className="font-mono text-accent">$1,000</strong> — M1 accepted (Hardhat plugin +
            verify dry-run published to npm)
          </li>
          <li>
            <strong className="font-mono text-accent">$1,000</strong> — M2 accepted (GitHub Action,
            official website, 12-month maintenance plan — grant complete)
          </li>
        </ol>
      </div>

      <p className="mt-8 text-center text-xs text-text-dim">
        Application under review —{' '}
        <a
          href={LINKS.grantsForumApp}
          target="_blank"
          rel="noreferrer"
          className="text-accent hover:underline"
        >
          forum thread
        </a>
        {' · '}
        <a href={LINKS.grantsOverview} target="_blank" rel="noreferrer" className="text-accent hover:underline">
          Integration Grants overview
        </a>
      </p>
    </main>
  )
}
