import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 's-maxage=60')
  res.status(200).json({ ok: true, service: 'verifyflow', version: '0.1.0' })
}
