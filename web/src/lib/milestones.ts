export type Milestone = {
  id: 'M0' | 'M1' | 'M2'
  title: string
  payout: number
  status: 'complete' | 'current' | 'planned'
  summary: string
  deliverables: string[]
  kpi: string[]
}

export const GRANT = {
  totalAsk: 3000,
  currency: 'USD (paid in CFX)',
  support: '12 months open-source maintenance, GitHub issues, and dependency updates',
  website: 'Official docs site published alongside M2',
} as const

export const MILESTONES: Milestone[] = [
  {
    id: 'M0',
    title: 'Prototype & public demo',
    payout: 1000,
    status: 'current',
    summary:
      'Ship the working preflight stack: CLI doctor, REST API, and grant-ready dashboard demo.',
    deliverables: [
      'verifyflow doctor — RPC, chainId, gas, ConfluxScan API checks',
      'ConfluxScan verify-payload linter (evmVersion, compiler, optimizer)',
      'Web dashboard with preflight rail + Monaco JSON editor',
      'Public localhost demo + README quickstart',
      'Forum-ready grant proposal assets',
    ],
    kpi: [
      'Demo runs end-to-end on testnet without manual RPC setup',
      'Known-bad payload (evmVersion=default) surfaces as BLOCKED',
      'CLI exits non-zero on failure for CI readiness',
    ],
  },
  {
    id: 'M1',
    title: 'Hardhat plugin & verify dry-run',
    payout: 1000,
    status: 'planned',
    summary:
      'Embed VerifyFlow into the standard Solidity workflow so teams catch misconfig before broadcast.',
    deliverables: [
      '@verifyflow/hardhat npm package',
      'hardhat verifyflow:doctor task + pre-deploy hook',
      'ConfluxScan verify dry-run (payload validation without submit)',
      'Bundled eSpace mainnet/testnet network presets (chainId 1030 / 71)',
      'Example Hardhat project + integration docs',
      'Migration checklist for teams moving from Ethereum tooling',
    ],
    kpi: [
      'Plugin published to npm with documented install path',
      'Sample contract deploy blocked when RPC chainId mismatches',
      'Verify dry-run catches evmversion=default before ConfluxScan submit',
      '≥3 documented integration paths (Hardhat, Foundry notes, CI snippet)',
    ],
  },
  {
    id: 'M2',
    title: 'GitHub Action, website & 1-year support',
    payout: 1000,
    status: 'planned',
    summary:
      'Complete the grant: PR gates for eSpace deploys, official website, and a year of maintained open source.',
    deliverables: [
      'verifyflow/action — GitHub Action for PR / deploy workflow gates',
      'Official website (docs, usage guides, milestone changelog)',
      'Open GitHub repository with issues, CONTRIBUTING, and release tags',
      '12-month maintenance: ConfluxScan API changes, RPC endpoint updates, security patches',
      'KPI logging — preflight runs, pass/warn/fail rates (privacy-preserving, opt-in)',
      'Export preflight report as Markdown from dashboard + CLI',
      'Grant completion report with numeric adoption metrics',
    ],
    kpi: [
      'Action listed on GitHub Marketplace or documented composite workflow',
      'Website live with usage page mirroring CLI + API flows',
      'Monthly release cadence documented for 12 months post-delivery',
      'Measurable preflight runs attributed via grant partner onboarding',
    ],
  },
]

export function milestoneById(id: Milestone['id']) {
  return MILESTONES.find((m) => m.id === id)
}
