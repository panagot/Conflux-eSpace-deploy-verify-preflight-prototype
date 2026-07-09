import { Terminal, Code, Globe, Keyboard } from '@phosphor-icons/react'
import { LINKS } from '../lib/links'

const sections = [
  {
    icon: Terminal,
    title: 'CLI — verifyflow doctor',
    body: 'Run preflight from your terminal before deploy or in CI scripts.',
    code: `# Testnet (default public RPC)
npm run doctor:testnet

# Mainnet
npm run doctor:mainnet

# Custom RPC + verify payload lint
node cli/dist/index.js doctor \\
  --network testnet \\
  --rpc https://evmtestnet.confluxrpc.com \\
  --payload examples/verify-payload-bad.json`,
    note: 'Exits code 1 when any check fails — suitable for CI gates.',
  },
  {
    icon: Globe,
    title: 'Web dashboard',
    body: 'Interactive preflight with Monaco JSON editor and visual preflight rail.',
    code: `cd verifyflow
npm install
npm run dev

# Dashboard → http://localhost:5180
# API       → http://localhost:8792`,
    note: 'Use "Run preflight" for full doctor, or "Lint payload only" for ConfluxScan field checks.',
  },
  {
    icon: Code,
    title: 'REST API',
    body: 'Embed VerifyFlow checks in your own tooling or automation.',
    code: `POST /api/doctor
{
  "network": "testnet",
  "rpcUrl": "https://evmtestnet.confluxrpc.com",
  "verifyPayload": {
    "compilerVersion": "v0.8.24+commit.e11b9ed9",
    "optimizationUsed": true,
    "runs": 200,
    "contractName": "MyToken"
  }
}

POST /api/lint-payload
{ "raw": "{ ... json string ... }" }`,
    note: 'Vite dev server proxies /api to port 8792 automatically.',
  },
  {
    icon: Keyboard,
    title: 'Keyboard & workflow tips',
    body: 'Recommended flow before every eSpace deploy.',
    code: `1. Select network (testnet 71 / mainnet 1030)
2. Confirm default RPC or set Advanced override
3. Paste ConfluxScan verify fields into payload editor
4. Run preflight — fix BLOCKED items first
5. Deploy via Hardhat / Foundry / Remix
6. Submit verification on ConfluxScan`,
    note: 'Omit evmVersion unless you used a concrete version. "default" is rejected by ConfluxScan.',
  },
]

export function UsagePage() {
  return (
    <main className="mx-auto max-w-[900px] flex-1 px-4 py-10 md:px-8">
      <header className="mb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
          Documentation
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text">Usage guide</h1>
        <p className="mt-3 max-w-[65ch] text-sm leading-relaxed text-text-muted">
          VerifyFlow validates your Conflux eSpace environment and ConfluxScan verify payload{' '}
          <em>before</em> you deploy. Use the CLI for CI, the dashboard for interactive debugging,
          or the REST API for custom integrations.
        </p>
      </header>

      <div className="mb-10 rounded-lg border border-border bg-surface-1 p-5">
        <h2 className="text-sm font-semibold text-text">What gets checked</h2>
        <ul className="mt-3 space-y-2 text-sm text-text-muted">
          <li>
            <strong className="text-text">RPC reachability</strong> — block number, latency, endpoint health
          </li>
          <li>
            <strong className="text-text">Chain ID</strong> — must be 71 (testnet) or 1030 (mainnet)
          </li>
          <li>
            <strong className="text-text">Gas / fee data</strong> — gasPrice availability for deploy estimation
          </li>
          <li>
            <strong className="text-text">ConfluxScan API</strong> — explorer verify endpoint reachability
          </li>
          <li>
            <strong className="text-text">Verify payload lint</strong> — compiler version, optimizer flags, evmVersion quirks
          </li>
        </ul>
      </div>

      <div className="space-y-8">
        {sections.map((s) => (
          <section key={s.title} className="border-t border-border pt-8 first:border-t-0 first:pt-0">
            <div className="flex items-center gap-2">
              <s.icon size={18} className="text-accent" />
              <h2 className="text-lg font-semibold text-text">{s.title}</h2>
            </div>
            <p className="mt-2 text-sm text-text-muted">{s.body}</p>
            <pre className="mt-4 overflow-x-auto rounded-md border border-border bg-surface-2 p-4 font-mono text-xs leading-relaxed text-text-muted">
              {s.code}
            </pre>
            <p className="mt-2 text-xs text-text-dim">{s.note}</p>
          </section>
        ))}
      </div>

      <div className="mt-12 rounded-lg border border-border bg-surface-1 p-5">
        <h2 className="text-sm font-semibold text-text">Default RPC endpoints</h2>
        <table className="mt-3 w-full text-left text-sm text-text-muted">
          <thead>
            <tr className="font-mono text-[10px] uppercase tracking-wider text-text-dim">
              <th className="pb-2 pr-4">Network</th>
              <th className="pb-2 pr-4">Chain ID</th>
              <th className="pb-2">RPC</th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            <tr>
              <td className="py-1 pr-4">eSpace Testnet</td>
              <td className="py-1 pr-4">71</td>
              <td className="py-1">https://evmtestnet.confluxrpc.com</td>
            </tr>
            <tr>
              <td className="py-1 pr-4">eSpace Mainnet</td>
              <td className="py-1 pr-4">1030</td>
              <td className="py-1">https://evm.confluxrpc.com</td>
            </tr>
          </tbody>
        </table>
        <p className="mt-4 text-xs text-text-dim">
          See{' '}
          <a href={LINKS.rpcProviders} target="_blank" rel="noreferrer" className="text-accent hover:underline">
            RPC providers
          </a>{' '}
          and{' '}
          <a href={LINKS.espaceDeveloperQuickstart} target="_blank" rel="noreferrer" className="text-accent hover:underline">
            developer quickstart
          </a>{' '}
          for alternate endpoints.
        </p>
      </div>

      <div className="mt-8 rounded-lg border border-warn/30 bg-warn/5 p-5">
        <h2 className="text-sm font-semibold text-warn">Known verify trap</h2>
        <p className="mt-2 text-sm text-text-muted">
          ConfluxScan rejects <code className="font-mono text-warn">evmVersion: &quot;default&quot;</code>.
          Omit the field when using compiler defaults. VerifyFlow flags this in the sample payload
          intentionally — run preflight to see the BLOCKED state.
        </p>
      </div>
    </main>
  )
}
