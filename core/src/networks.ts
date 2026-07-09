export type NetworkId = 'mainnet' | 'testnet'

export type NetworkConfig = {
  id: NetworkId
  label: string
  chainId: number
  chainIdHex: string
  defaultRpc: string
  explorer: string
  explorerApi: string
  currency: string
}

export const NETWORKS: Record<NetworkId, NetworkConfig> = {
  mainnet: {
    id: 'mainnet',
    label: 'Conflux eSpace Mainnet',
    chainId: 1030,
    chainIdHex: '0x406',
    defaultRpc: 'https://evm.confluxrpc.com',
    explorer: 'https://evm.confluxscan.io',
    explorerApi: 'https://evmapi.confluxscan.org/api',
    currency: 'CFX',
  },
  testnet: {
    id: 'testnet',
    label: 'Conflux eSpace Testnet',
    chainId: 71,
    chainIdHex: '0x47',
    defaultRpc: 'https://evmtestnet.confluxrpc.com',
    explorer: 'https://evmtestnet.confluxscan.io',
    explorerApi: 'https://evmapi-testnet.confluxscan.org/api',
    currency: 'CFX',
  },
}

export const PUBLIC_RPC_ALTERNATIVES: Record<NetworkId, string[]> = {
  mainnet: [
    'https://evm.confluxrpc.com',
    'https://conflux-espace-public.unifra.io',
    'https://conflux-espace.blockpi.network/v1/rpc/public',
  ],
  testnet: ['https://evmtestnet.confluxrpc.com'],
}
