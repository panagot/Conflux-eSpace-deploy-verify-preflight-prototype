import { JsonRpcProvider } from 'ethers'
import type { NetworkConfig } from '../networks.js'
import type { CheckResult } from '../types.js'

export async function checkRpcReachability(
  rpcUrl: string,
  network: NetworkConfig,
): Promise<CheckResult> {
  const start = Date.now()
  const provider = new JsonRpcProvider(rpcUrl, network.chainId, { staticNetwork: true })
  try {
    const [blockNumber, chainId, networkVersion] = await Promise.all([
      provider.getBlockNumber(),
      provider.getNetwork().then((n: { chainId: bigint }) => Number(n.chainId)),
      provider.send('net_version', []).catch(() => null),
    ])

    const durationMs = Date.now() - start
    const chainOk = chainId === network.chainId

    if (!chainOk) {
      return {
        id: 'rpc-chain-id',
        name: 'RPC chain ID',
        status: 'fail',
        message: `Wrong chainId: got ${chainId}, expected ${network.chainId} (${network.label})`,
        detail: 'Point MetaMask / Hardhat at the correct eSpace network before deploy.',
        durationMs,
        meta: { reportedChainId: chainId, expectedChainId: network.chainId, blockNumber },
      }
    }

    return {
      id: 'rpc-reachability',
      name: 'RPC reachability',
      status: durationMs > 3000 ? 'warn' : 'pass',
      message:
        durationMs > 3000
          ? `RPC responded in ${durationMs}ms (elevated latency)`
          : `RPC healthy — block ${blockNumber}, chainId ${chainId}`,
      detail: networkVersion != null ? `net_version: ${networkVersion}` : undefined,
      durationMs,
      meta: { blockNumber, chainId, latencyMs: durationMs },
    }
  } catch (err) {
    return {
      id: 'rpc-reachability',
      name: 'RPC reachability',
      status: 'fail',
      message: `RPC unreachable: ${err instanceof Error ? err.message : String(err)}`,
      detail: 'Verify URL, firewall, and that HTTP/WebSocket ports are open for self-hosted nodes.',
      durationMs: Date.now() - start,
    }
  } finally {
    provider.destroy()
  }
}

export async function checkGasAndFeeData(
  rpcUrl: string,
  network: NetworkConfig,
): Promise<CheckResult> {
  const start = Date.now()
  const provider = new JsonRpcProvider(rpcUrl, network.chainId, { staticNetwork: true })
  try {
    const feeData = await provider.getFeeData()
    const durationMs = Date.now() - start
    const gasPrice = feeData.gasPrice

    if (!gasPrice || gasPrice === 0n) {
      return {
        id: 'gas-estimate',
        name: 'Gas / fee data',
        status: 'warn',
        message: 'Could not read gasPrice — deploy may still work via EIP-1559 fields',
        durationMs,
      }
    }

    return {
      id: 'gas-estimate',
      name: 'Gas / fee data',
      status: 'pass',
      message: `gasPrice available (${gasPrice.toString()} wei)`,
      detail: 'Conflux supports fee sponsorship for onboarding — ensure paymaster if targeting gasless UX.',
      durationMs,
      meta: { gasPriceWei: gasPrice.toString() },
    }
  } catch (err) {
    return {
      id: 'gas-estimate',
      name: 'Gas / fee data',
      status: 'warn',
      message: `Fee data check skipped: ${err instanceof Error ? err.message : String(err)}`,
      durationMs: Date.now() - start,
    }
  } finally {
    provider.destroy()
  }
}

export async function checkExplorerApi(network: NetworkConfig): Promise<CheckResult> {
  const start = Date.now()
  const url = `${network.explorerApi}?module=stats&action=ethsupply`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'verifyflow/0.1 (+https://github.com/panagot)' },
      signal: AbortSignal.timeout(12_000),
    })
    const durationMs = Date.now() - start
    if (!res.ok) {
      return {
        id: 'explorer-api',
        name: 'ConfluxScan API',
        status: 'warn',
        message: `Explorer API HTTP ${res.status}`,
        detail: network.explorerApi,
        durationMs,
      }
    }
    return {
      id: 'explorer-api',
      name: 'ConfluxScan API',
      status: 'pass',
      message: 'ConfluxScan API reachable (verify endpoint available)',
      detail: network.explorer,
      durationMs,
    }
  } catch (err) {
    return {
      id: 'explorer-api',
      name: 'ConfluxScan API',
      status: 'warn',
      message: `Explorer API check failed: ${err instanceof Error ? err.message : String(err)}`,
      detail: 'Verification can still proceed via manual upload; API used for automation.',
      durationMs: Date.now() - start,
    }
  }
}
