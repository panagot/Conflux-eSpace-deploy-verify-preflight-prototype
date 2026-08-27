# Demo — BLOCKED on `evmVersion: "default"`

## CLI (recorded)

```bash
npx verifyflow doctor --network testnet --payload examples/bad-verify.json
# exit 1
```

See [demo-cli-transcript.txt](./demo-cli-transcript.txt) for a fresh local capture.

```bash
npx verifyflow doctor --network testnet --payload examples/good-verify.json
# exit 0 when public RPC is healthy
```

## Dashboard (20–30s screen capture)

1. Open https://conflux-e-space-deploy-verify-prefl-gamma.vercel.app/
2. Click **Known-bad payload** (or keep the default sample)
3. Click **Run sample preflight** → gate shows **BLOCKED**, Verify fail on `evmVersion`
4. Click **Apply ConfluxScan fix and re-run** → **READY**

Packaged loop GIF (CLI story): [demo.gif](./demo.gif) — regenerate with `node scripts/make-demo-gif.mjs`.
For the forum, a real browser screen recording of steps 1–4 is still stronger if you have 30 seconds.

## curl

Copy-paste block lives on the Usage page (`CopyCurlBlock`). Same known-bad body → `ready: false`.
