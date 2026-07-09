# VerifyFlow

**Conflux eSpace deploy & verify preflight** — catch RPC misconfiguration, chain ID drift, and ConfluxScan verify mistakes before you burn a deployment cycle.

[![Live Demo](https://img.shields.io/badge/demo-Vercel-00d4aa?style=flat-square)](https://conflux-e-space-deploy-verify-prefl-gamma.vercel.app/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Conflux](https://img.shields.io/badge/chain-Conflux%20eSpace-1b9ce3?style=flat-square)](https://doc.confluxnetwork.org/docs/espace/DeveloperQuickstart)

**Live demo:** [conflux-e-space-deploy-verify-prefl-gamma.vercel.app](https://conflux-e-space-deploy-verify-prefl-gamma.vercel.app/)

---

## Why VerifyFlow?

Teams deploy Solidity contracts to [Conflux eSpace](https://doc.confluxnetwork.org/docs/espace/DeveloperQuickstart) then fail [ConfluxScan](https://evmtestnet.confluxscan.io) verification — wrong `chainId`, RPC drift, or verify JSON quirks like `evmVersion: "default"`. Each failed cycle costs time, gas, and momentum.

VerifyFlow runs a **preflight checklist** against live infrastructure before you deploy:

| Check | What it validates |
|-------|-------------------|
| **RPC reachability** | Block number, latency, endpoint health |
| **Chain ID** | Must match eSpace mainnet `1030` or testnet `71` |
| **Gas / fee data** | `gasPrice` availability for deploy estimation |
| **ConfluxScan API** | Explorer verify endpoint reachability |
| **Verify payload lint** | Compiler version, optimizer flags, known ConfluxScan rejections |

---

## Features

- **Preflight rail** — visual stepper: RPC → Chain → Gas → Explorer → Verify
- **Monaco JSON editor** — edit ConfluxScan verify fields with syntax highlighting
- **Ready / Blocked gate** — clear pass/fail before mainnet
- **REST API** — embed checks in CI or custom tooling
- **Usage & milestones pages** — in-app docs and grant roadmap
- **Tooltips** — inline guidance for network, RPC, and verify quirks

---

## Quick start (local)

```bash
git clone https://github.com/panagot/Conflux-eSpace-deploy-verify-preflight-prototype.git
cd Conflux-eSpace-deploy-verify-preflight-prototype
npm install
npm run build:vercel
npm run dev
```

Open **http://localhost:5180**

| Page | URL |
|------|-----|
| Dashboard | http://localhost:5180 |
| Usage guide | http://localhost:5180/usage |
| Milestones | http://localhost:5180/milestones |

Click **Run preflight** on testnet. The sample payload intentionally includes `evmVersion: "default"` — VerifyFlow flags this as a known [ConfluxScan rejection](https://github.com/conflux-fans/conflux-skills/issues/5).

---

## Deploy to Vercel

This repo is configured for Vercel with serverless API routes.

### Recommended settings

| Setting | Value |
|---------|-------|
| **Root Directory** | `web` |
| **Framework Preset** | Other |
| **Build Command** | `npm run build:vercel` (from `web/vercel.json`) |
| **Install Command** | `npm install --prefix .. --include=dev` |
| **Output Directory** | `dist` |

### How it works

1. Install runs at monorepo root (`npm install --prefix ..`)
2. Build compiles `@verifyflow/core`, copies `core/dist` → `web/core-dist/`
3. Vite builds the React dashboard to `web/dist`
4. API routes in `web/api/` import from `web/core-dist/` at runtime

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/panagot/Conflux-eSpace-deploy-verify-preflight-prototype&root-directory=web)

---

## API reference

Base URL: your deployment origin (e.g. `https://conflux-e-space-deploy-verify-prefl-gamma.vercel.app`)

### `GET /api/health`

```json
{ "ok": true, "service": "verifyflow", "version": "0.1.0" }
```

### `GET /api/networks`

Returns eSpace mainnet and testnet configs (chainId, default RPC, explorer, alternatives).

### `POST /api/doctor`

Run full preflight against live RPC and optional verify payload.

```json
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
```

Response:

```json
{
  "network": "testnet",
  "rpcUrl": "https://evmtestnet.confluxrpc.com",
  "ranAt": "2026-07-09T12:00:00.000Z",
  "ready": false,
  "summary": { "pass": 7, "warn": 0, "fail": 1, "skip": 0 },
  "checks": [ ... ]
}
```

### `POST /api/lint-payload`

Lint ConfluxScan verify fields only (no RPC calls).

```json
{ "raw": "{ \"evmVersion\": \"default\", \"compilerVersion\": \"v0.8.24+commit...\" }" }
```

---

## Default RPC endpoints

| Network | Chain ID | RPC | Explorer |
|---------|----------|-----|----------|
| eSpace Testnet | `71` | `https://evmtestnet.confluxrpc.com` | [evmtestnet.confluxscan.io](https://evmtestnet.confluxscan.io) |
| eSpace Mainnet | `1030` | `https://evm.confluxrpc.com` | [evm.confluxscan.io](https://evm.confluxscan.io) |

See [Conflux RPC providers](https://doc.confluxnetwork.org/docs/espace/build/infrastructure/RPC-Provider/) for alternatives.

---

## Project structure

```
├── core/                  @verifyflow/core — doctor engine (TypeScript)
│   └── src/
│       ├── checks/        RPC, verify-payload lint
│       ├── networks.ts    chainId 71 / 1030 configs
│       └── index.ts       runDoctor()
├── web/                   React dashboard (Vite + Tailwind)
│   ├── api/               Vercel serverless routes
│   ├── core-dist/         Built core (generated at build, gitignored)
│   ├── scripts/           copy-core-dist.mjs
│   └── src/
│       ├── components/    PreflightRail, CheckStream, Monaco editor
│       ├── pages/         Dashboard, Usage, Milestones
│       └── hooks/         useDoctor (API client)
├── api/                   Root-level API routes (repo-root deploys)
├── vercel.json            Root deploy config (optional)
└── package.json           npm workspaces: core + web
```

---

## Grant roadmap (CFX-01)

VerifyFlow is a prototype for [Conflux Integration Grants](https://confluxnetwork.org/en/developers/grants). Total ask: **$3,000** (3 × $1,000 milestones).

| Milestone | Payout | Deliverable |
|-----------|--------|-------------|
| **M0** · Prototype | $1,000 | CLI, API, dashboard — **current** |
| **M1** · Hardhat | $1,000 | `@verifyflow/hardhat` plugin, verify dry-run, npm publish |
| **M2** · CI + support | $1,000 | GitHub Action, official site, 12-month OSS maintenance |

Full KPIs and deliverables: [Milestones page](https://conflux-e-space-deploy-verify-prefl-gamma.vercel.app/milestones) on the live demo.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Core | TypeScript, ethers v6 |
| API | Vercel Serverless Functions (`@vercel/node`) |
| Frontend | React 19, Vite 6, Tailwind CSS v4, Framer Motion |
| Editor | Monaco (JSON verify payload) |
| Fonts | Sora + JetBrains Mono |

---

## Known verify traps

| Issue | VerifyFlow behavior |
|-------|---------------------|
| `evmVersion: "default"` | **FAIL** — ConfluxScan rejects this value |
| Wrong `chainId` | **FAIL** — RPC must report 71 or 1030 |
| Missing `compilerVersion` | **FAIL** — required for verify |
| Elevated RPC latency (>3s) | **WARN** — deploy may still work |

Reference: [conflux-skills #5](https://github.com/conflux-fans/conflux-skills/issues/5)

---

## Development

```bash
# Build core + web + copy core-dist
npm run build:vercel

# Local dev with Vercel serverless API
npm run dev

# Preview production build
npm run preview:web
```

### Environment

No secrets required. All checks use public Conflux RPC and ConfluxScan API endpoints.

---

## Links

| Resource | URL |
|----------|-----|
| eSpace developer quickstart | [doc.confluxnetwork.org](https://doc.confluxnetwork.org/docs/espace/DeveloperQuickstart) |
| ConfluxScan API | [doc.confluxnetwork.org](https://doc.confluxnetwork.org/docs/espace/build/infrastructure/confluxscan-api/) |
| Integration grants forum | [forum.conflux.fun](https://forum.conflux.fun/c/English/grant-proposals) |
| Grants application template | [forum.conflux.fun](https://forum.conflux.fun/t/integration-grants-application-template/20759) |

---

## Author

**Panagiotis Pollis** ([@panagot](https://github.com/panagot))

Parallel grant track: [Zcash Indexer Observatory](https://github.com/panagot/zcash-indexer-observatory) ([#343](https://github.com/ZcashCommunityGrants/zcashcommunitygrants/issues/343))

**License:** MIT
