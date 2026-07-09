import { NETWORKS, type NetworkId } from './networks.js'
import { checkExplorerApi, checkGasAndFeeData, checkRpcReachability } from './checks/rpc.js'
import { lintVerifyPayload, type VerifyPayloadInput } from './checks/verify-payload.js'
import type { DoctorReport } from './types.js'
import { isReady, summarize } from './types.js'

export type RunDoctorOptions = {
  network: NetworkId
  rpcUrl?: string
  verifyPayload?: VerifyPayloadInput
}

export async function runDoctor(options: RunDoctorOptions): Promise<DoctorReport> {
  const network = NETWORKS[options.network]
  const rpcUrl = options.rpcUrl?.trim() || network.defaultRpc

  const checks = await Promise.all([
    checkRpcReachability(rpcUrl, network),
    checkGasAndFeeData(rpcUrl, network),
    checkExplorerApi(network),
  ])

  if (options.verifyPayload) {
    checks.push(...lintVerifyPayload(options.verifyPayload))
  }

  const flat = checks.flat()
  const summary = summarize(flat)

  return {
    network: network.id,
    rpcUrl,
    ranAt: new Date().toISOString(),
    summary,
    checks: flat,
    ready: isReady(flat),
  }
}

export { NETWORKS, PUBLIC_RPC_ALTERNATIVES } from './networks.js'
export type { NetworkId, NetworkConfig } from './networks.js'
export type { CheckResult, CheckStatus, DoctorReport } from './types.js'
export { lintVerifyPayload, lintVerifyPayloadJson } from './checks/verify-payload.js'
export type { VerifyPayloadInput } from './checks/verify-payload.js'
