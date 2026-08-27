import http from 'node:http'
import {
  runDoctor,
  NETWORKS,
  lintVerifyPayload,
  lintVerifyPayloadJson,
} from '@verifyflow/core'
import { PUBLIC_RPC_ALTERNATIVES } from '@verifyflow/core/networks'

const PORT = Number(process.env.PORT || 8792)

function send(res, status, body) {
  const json = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(json)
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  if (!chunks.length) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    return null
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`)
  const path = url.pathname.replace(/\/$/, '') || '/'

  if (req.method === 'OPTIONS') {
    send(res, 204, {})
    return
  }

  try {
    if (req.method === 'GET' && (path === '/api/health' || path === '/health')) {
      send(res, 200, { ok: true, service: 'verifyflow', version: '0.1.0' })
      return
    }

    if (req.method === 'GET' && (path === '/api/networks' || path === '/networks')) {
      send(res, 200, {
        networks: Object.values(NETWORKS).map((n) => ({
          id: n.id,
          label: n.label,
          chainId: n.chainId,
          defaultRpc: n.defaultRpc,
          explorer: n.explorer,
          currency: n.currency,
          rpcAlternatives: PUBLIC_RPC_ALTERNATIVES[n.id],
        })),
      })
      return
    }

    if (req.method === 'POST' && (path === '/api/doctor' || path === '/doctor')) {
      const body = await readBody(req)
      if (body === null) {
        send(res, 400, { error: 'Invalid JSON body' })
        return
      }
      const network = body.network ?? 'testnet'
      if (!(network in NETWORKS)) {
        send(res, 400, { error: `Invalid network: ${network}` })
        return
      }
      const report = await runDoctor({
        network,
        rpcUrl: body.rpcUrl,
        verifyPayload: body.verifyPayload,
      })
      send(res, 200, report)
      return
    }

    if (req.method === 'POST' && (path === '/api/lint-payload' || path === '/lint-payload')) {
      const body = await readBody(req)
      if (body === null) {
        send(res, 400, { error: 'Invalid JSON body' })
        return
      }
      if (typeof body.raw === 'string') {
        send(res, 200, lintVerifyPayloadJson(body.raw))
        return
      }
      if (body.payload && typeof body.payload === 'object') {
        const checks = lintVerifyPayload(body.payload)
        const ok = checks.every((c) => c.status !== 'fail')
        send(res, 200, { ok, checks })
        return
      }
      send(res, 400, { error: 'Provide { raw: string } or { payload: object }' })
      return
    }

    send(res, 404, { error: 'Not found' })
  } catch (err) {
    send(res, 500, {
      error: err instanceof Error ? err.message : 'Server error',
    })
  }
})

server.listen(PORT, () => {
  console.log(`[verifyflow] local API on http://localhost:${PORT}`)
})
