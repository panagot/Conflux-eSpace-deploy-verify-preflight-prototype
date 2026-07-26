import { useEffect, useRef, useState } from 'react'
import { ChatCircleDots, X, PaperPlaneTilt } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { LINKS } from '../lib/links'

type Msg = { who: 'bot' | 'me'; html: string }

const CHIPS: [string, string][] = [
  ['What is this?', 'what is this'],
  ['Who is it for?', 'who is this for'],
  ['Why BLOCKED?', 'why blocked evmversion'],
  ['How do I try it?', 'how to try demo'],
  ['Grant / milestones?', 'grant milestones budget'],
  ['vs ConfluxScan?', 'vs confluxscan'],
]

function answer(q: string): string {
  const t = (q || '').toLowerCase().trim()
  if (!t) return 'Ask about the demo, BLOCKED results, the grant, or how VerifyFlow fits Conflux eSpace.'

  if (/(what is|what does|purpose|about this|explain|overview)/.test(t)) {
    return 'VerifyFlow is a <b>preflight</b> for Conflux eSpace: it checks RPC, chainId (71/1030), gas data, ConfluxScan API health, and verify-payload lint <b>before</b> you deploy — so you don’t burn a cycle on a known reject.'
  }
  if (/(who|audience|for whom|users|developers)/.test(t)) {
    return '<b>Primary:</b> Solidity teams deploying to eSpace (Hardhat / Foundry / Remix). <b>Also:</b> CI gates and integrators who want a Ready/Blocked answer before mainnet. Not a wallet, not an explorer, not a deploy service.'
  }
  if (/(blocked|evmversion|default|fail|red|rejection|conflux-skills)/.test(t)) {
    return 'The sample payload includes <code>evmVersion: "default"</code>, which ConfluxScan rejects (see <a href="' +
      LINKS.confluxSkillsIssue +
      '" target="_blank" rel="noreferrer">conflux-skills #5</a>). Click <b>Run preflight</b> with the sample payload — Verify should go red and the gate shows <b>BLOCKED</b>. Fix: omit <code>evmVersion</code> unless you used a concrete version (e.g. paris, cancun).'
  }
  if (/(try|demo|how to|start|run|preflight)/.test(t)) {
    return '1) Pick <b>Testnet 71</b> (safe). 2) Keep or edit the sample payload. 3) Click <b>Run preflight</b>. 4) Read the rail + results. If Verify fails on <code>evmVersion</code>, remove that field and re-run to see <b>READY</b>.'
  }
  if (/(grant|milestone|budget|3000|funding|m0|m1|m2)/.test(t)) {
    return 'Integration Grants ask: <b>$3,000</b> in three $1,000 milestones. <b>M0</b> live demo + API (CLI packaging remaining). <b>M1</b> Hardhat plugin + verify dry-run. <b>M2</b> GitHub Action, public repo, official site, 12-month OSS maintenance. Details on the <a href="/milestones">Milestones</a> page or the <a href="' +
      LINKS.grantsForumApp +
      '" target="_blank" rel="noreferrer">forum application</a>.'
  }
  if (/(vs|versus|confluxscan|hardhat|overlap|duplicate|explorer)/.test(t)) {
    return '<b>ConfluxScan</b> verifies after deploy. <b>Hardhat</b> is generic EVM. VerifyFlow is Conflux-aware <b>pre-deploy</b> QA (chainId 71/1030 + ConfluxScan field quirks). Complementary — it does not submit verify or hold keys.'
  }
  if (/(github|source|repo|open source|mit|code)/.test(t)) {
    return 'MIT-licensed open source. Full public GitHub + npm packages ship with funded milestones (M0 CLI packaging / M2 open repo cadence). Reviewers can use this live demo + REST API now; source is available to the committee on request per the grant application.'
  }
  if (/(api|curl|ci|json|rest)/.test(t)) {
    return 'REST: <code>POST /api/doctor</code> (full preflight) and <code>POST /api/lint-payload</code> (fields only). See the <a href="/usage">Usage</a> page for copy-paste bodies. Lint alone is enough to catch <code>evmVersion=default</code> without hitting RPC.'
  }
  if (/(rpc|chain|1030|71|mainnet|testnet)/.test(t)) {
    return 'Testnet chainId <b>71</b>, mainnet <b>1030</b>. Defaults use public Conflux RPCs; Advanced override lets you point at your own endpoint. Wrong chainId → BLOCKED.'
  }
  if (/(safe|privacy|keys|wallet|custody)/.test(t)) {
    return 'Privacy-safe: public RPC + ConfluxScan probes only. <b>No private keys, no custody, no deploy submission.</b> You keep deploying with your own tooling.'
  }

  return 'Not sure on that one. Try a chip below — or ask about <b>BLOCKED</b>, <b>who it’s for</b>, <b>grant milestones</b>, or <b>vs ConfluxScan</b>.'
}

export function AssistantFab() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [greeted, setGreeted] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [msgs, open])

  const push = (html: string, who: 'bot' | 'me' = 'bot') => {
    setMsgs((m) => [...m, { who, html }])
  }

  const ask = (q: string) => {
    const text = q.trim()
    if (!text) return
    push(text.replace(/</g, '&lt;'), 'me')
    setInput('')
    window.setTimeout(() => push(answer(text)), 120)
  }

  const openChat = () => {
    setOpen(true)
    if (!greeted) {
      setGreeted(true)
      push(
        'Hi — I’m the VerifyFlow guide for reviewers and builders. Ask about the demo, why the sample is <b>BLOCKED</b>, who uses this, or the $3k milestones. Tap a question or type your own.',
      )
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={openChat}
          className="fixed bottom-5 right-5 z-[80] flex items-center gap-2 rounded-full border border-accent/40 bg-accent px-4 py-3 text-sm font-semibold text-surface-0 shadow-[0_8px_28px_rgba(0,0,0,0.45)] transition hover:brightness-110"
        >
          <ChatCircleDots size={18} weight="fill" />
          Ask VerifyFlow
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-[90] flex h-[min(540px,calc(100vh-40px))] w-[min(370px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-border bg-surface-1 shadow-[0_24px_64px_rgba(0,0,0,0.55)]">
          <div className="flex items-center gap-3 border-b border-border bg-gradient-to-b from-accent/15 to-transparent px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-text">VerifyFlow assistant</p>
              <p className="text-[10px] text-text-muted">FAQ · live demo help · grant basics</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ml-auto text-text-muted hover:text-text"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div ref={bodyRef} className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-3.5">
            {msgs.map((m, i) => (
              <div
                key={i}
                className={`max-w-[88%] rounded-xl px-3 py-2 text-[12.5px] leading-relaxed ${
                  m.who === 'bot'
                    ? 'self-start rounded-bl-sm border border-border bg-surface-2 text-text-muted'
                    : 'self-end rounded-br-sm border border-accent/30 bg-accent/15 text-text'
                }`}
                dangerouslySetInnerHTML={{ __html: m.html }}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5 px-3.5 pb-2">
            {CHIPS.map(([label, q]) => (
              <button
                key={label}
                type="button"
                onClick={() => ask(q)}
                className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] text-accent hover:bg-accent/20"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') ask(input)
              }}
              placeholder="Ask about the demo…"
              className="flex-1 rounded-lg border border-border bg-surface-0 px-3 py-2 text-sm text-text outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={() => ask(input)}
              className="rounded-lg bg-accent px-3 text-surface-0"
              aria-label="Send"
            >
              <PaperPlaneTilt size={16} weight="fill" />
            </button>
          </div>

          <p className="border-t border-border px-3 py-2 text-center text-[10px] text-text-dim">
            Tip:{' '}
            <Link to="/" className="text-accent hover:underline">
              Dashboard
            </Link>{' '}
            ·{' '}
            <Link to="/milestones" className="text-accent hover:underline">
              Milestones
            </Link>
          </p>
        </div>
      )}
    </>
  )
}
