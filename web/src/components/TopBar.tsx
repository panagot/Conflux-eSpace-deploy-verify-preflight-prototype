import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { GitBranch, List, Terminal, BookOpen, CaretDown } from '@phosphor-icons/react'
import { LINKS } from '../lib/links'
import { MILESTONES } from '../lib/milestones'
import type { NetworkInfo } from '../types'

type Props = {
  network: string
  selected?: NetworkInfo
}

export function TopBar({ network, selected }: Props) {
  const chainId = selected?.chainId ?? (network === 'mainnet' ? 1030 : 71)
  const location = useLocation()
  const [milestonesOpen, setMilestonesOpen] = useState(false)

  const navClass = (path: string) =>
    location.pathname === path
      ? 'text-accent'
      : 'text-text-muted hover:text-text'

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface-0/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
          <div
            className="flex h-9 w-9 items-center justify-center rounded border border-border text-accent"
            aria-hidden
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
              <path
                d="M4 18 L12 4 L20 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <path d="M7 14 H17" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="14" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight">VerifyFlow</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-dim">
                CFX-01
              </span>
            </div>
            <p className="text-xs text-text-muted">eSpace deploy &amp; verify preflight</p>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden rounded border border-border bg-surface-1 px-2.5 py-1 font-mono text-xs text-accent sm:inline">
            chainId {chainId}
          </span>

          <nav className="flex items-center gap-1 text-sm sm:gap-3">
            <Link to="/" className={`hidden px-2 py-1 sm:inline ${navClass('/')}`}>
              Dashboard
            </Link>
            <Link
              to="/usage"
              className={`flex items-center gap-1 px-2 py-1 ${navClass('/usage')}`}
            >
              <BookOpen size={14} className="sm:hidden" />
              <span className="hidden sm:inline">Usage</span>
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setMilestonesOpen(!milestonesOpen)}
                onBlur={() => setTimeout(() => setMilestonesOpen(false), 150)}
                className={`flex items-center gap-1 px-2 py-1 ${location.pathname === '/milestones' ? 'text-accent' : 'text-text-muted hover:text-text'}`}
              >
                <List size={14} />
                <span className="hidden sm:inline">Milestones</span>
                <CaretDown size={10} className={milestonesOpen ? 'rotate-180' : ''} />
              </button>

              {milestonesOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-md border border-border bg-surface-1 p-2 shadow-xl">
                  <p className="px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-text-dim">
                    $3,000 grant · 3 × $1,000
                  </p>
                  {MILESTONES.map((m) => (
                    <Link
                      key={m.id}
                      to="/milestones"
                      onClick={() => setMilestonesOpen(false)}
                      className="block rounded px-2 py-2 transition-colors hover:bg-surface-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-accent">{m.id}</span>
                        <span className="font-mono text-[10px] text-text-dim">${m.payout}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-text-muted">{m.title}</p>
                    </Link>
                  ))}
                  <Link
                    to="/milestones"
                    onClick={() => setMilestonesOpen(false)}
                    className="mt-1 block border-t border-border px-2 pt-2 text-center text-xs text-accent hover:underline"
                  >
                    View full roadmap →
                  </Link>
                </div>
              )}
            </div>

            <a
              href={LINKS.espaceDeveloperQuickstart}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 px-2 py-1 text-text-muted transition-colors hover:text-accent lg:flex"
            >
              <Terminal size={14} weight="duotone" />
              eSpace docs
            </a>
            <a
              href={LINKS.grantsForum}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 px-2 py-1 text-text-muted transition-colors hover:text-accent md:flex"
            >
              <GitBranch size={14} weight="duotone" />
              Grants
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
