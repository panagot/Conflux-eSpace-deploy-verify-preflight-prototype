import type { VercelRequest, VercelResponse } from '@vercel/node'
import { runDoctor, NETWORKS, type NetworkId } from '@verifyflow/core'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const network = (req.body?.network ?? 'testnet') as NetworkId
  if (!(network in NETWORKS)) {
    res.status(400).json({ error: `Invalid network: ${network}` })
    return
  }

  try {
    const report = await runDoctor({
      network,
      rpcUrl: req.body?.rpcUrl,
      verifyPayload: req.body?.verifyPayload,
    })
    res.status(200).json(report)
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Doctor run failed',
    })
  }
}
