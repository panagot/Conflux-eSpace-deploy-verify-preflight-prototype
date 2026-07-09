import type { VercelRequest, VercelResponse } from '@vercel/node'
import { NETWORKS, PUBLIC_RPC_ALTERNATIVES } from '../core/dist/index.js'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 's-maxage=300')
  res.status(200).json({
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
}
