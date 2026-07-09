# VerifyFlow — Conflux eSpace Deploy & Verify Preflight

Preflight toolkit for Conflux eSpace: validate RPC, chainId, ConfluxScan API, and verify payloads before deploy.

**Live demo:** Deploy to Vercel from this repo.

## Quick start (local)

```bash
npm install
npm run build:vercel
npm run dev
```

| Service | URL |
|---------|-----|
| Dashboard | http://localhost:5180 |
| Usage | http://localhost:5180/usage |
| Milestones | http://localhost:5180/milestones |

## Deploy (Vercel)

1. Import this repository in [Vercel](https://vercel.com)
2. Framework preset: **Vite** (or Other — uses `vercel.json`)
3. Deploy — API routes run as serverless functions under `/api/*`

## What it checks

- RPC reachability & latency
- Chain ID (71 testnet / 1030 mainnet)
- Gas / fee data
- ConfluxScan API health
- Verify-payload lint (`evmVersion: "default"` rejection)

## Structure

```
core/   Doctor engine
web/    React dashboard
api/    Vercel serverless routes
```

MIT · [Panagiotis Pollis](https://github.com/panagot)
