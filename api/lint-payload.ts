import type { VercelRequest, VercelResponse } from '@vercel/node'
import { lintVerifyPayload, lintVerifyPayloadJson } from '../core/dist/index.js'

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (typeof req.body?.raw === 'string') {
    res.status(200).json(lintVerifyPayloadJson(req.body.raw))
    return
  }

  if (req.body?.payload && typeof req.body.payload === 'object') {
    const checks = lintVerifyPayload(req.body.payload)
    const ok = checks.every((c) => c.status !== 'fail')
    res.status(200).json({ ok, checks })
    return
  }

  res.status(400).json({ error: 'Provide { raw: string } or { payload: object }' })
}
