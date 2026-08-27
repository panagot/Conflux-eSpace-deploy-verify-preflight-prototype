import { Link } from 'react-router-dom'
import { GithubLogo, ArrowSquareOut } from '@phosphor-icons/react'
import { LINKS } from '../lib/links'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface-1">
      <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="text-sm font-semibold text-text">VerifyFlow</p>
            <p className="mt-2 max-w-sm text-xs leading-relaxed text-text-muted">
              Conflux eSpace deploy &amp; verify preflight. Catch RPC drift, chainId mismatches,
              and ConfluxScan verify mistakes before you burn a deployment cycle.
            </p>
            <p className="mt-3 font-mono text-[11px] text-text-dim">MIT · CLI + dashboard + REST API</p>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-dim">
              Product
            </p>
            <ul className="mt-3 space-y-2 text-sm text-text-muted">
              <li>
                <Link to="/" className="transition-colors hover:text-accent">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/usage" className="transition-colors hover:text-accent">
                  Usage guide
                </Link>
              </li>
              <li>
                <Link to="/milestones" className="transition-colors hover:text-accent">
                  Roadmap
                </Link>
              </li>
              <li>
                <a
                  href={LINKS.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-accent"
                >
                  <GithubLogo size={14} />
                  Source (GitHub)
                </a>
              </li>
              <li>
                <a
                  href={LINKS.grantsForumApp}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-accent"
                >
                  Grant thread
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-dim">
              Conflux resources
            </p>
            <ul className="mt-3 space-y-2 text-sm text-text-muted">
              <li>
                <a href={LINKS.espaceDeveloperQuickstart} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 transition-colors hover:text-accent">
                  eSpace developer quickstart
                  <ArrowSquareOut size={12} />
                </a>
              </li>
              <li>
                <a href={LINKS.rpcProviders} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 transition-colors hover:text-accent">
                  RPC providers
                  <ArrowSquareOut size={12} />
                </a>
              </li>
              <li>
                <a href={LINKS.confluxScanApi} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 transition-colors hover:text-accent">
                  ConfluxScan API
                  <ArrowSquareOut size={12} />
                </a>
              </li>
              <li>
                <a href={LINKS.grantsProgram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 transition-colors hover:text-accent">
                  Integration grants
                  <ArrowSquareOut size={12} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-mono text-[11px] text-text-dim">
            v0.1 · Conflux eSpace preflight
          </span>
          <span className="font-mono text-[11px] text-text-dim">
            Built by Panagiotis Pollis · MIT
          </span>
        </div>
      </div>
    </footer>
  )
}
