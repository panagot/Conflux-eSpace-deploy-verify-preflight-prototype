import { useState } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import type { NetworkInfo } from '../types'
import { Tooltip } from './Tooltip'
import { LINKS } from '../lib/links'

type Props = {
  networks: NetworkInfo[]
  network: string
  onNetworkChange: (id: string) => void
  rpcUrl: string
  onRpcChange: (url: string) => void
  selected?: NetworkInfo
}

export function NetworkControl({
  networks,
  network,
  onNetworkChange,
  rpcUrl,
  onRpcChange,
  selected,
}: Props) {
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const options =
    networks.length > 0
      ? networks
      : [
          { id: 'testnet', label: 'Conflux eSpace Testnet', chainId: 71, defaultRpc: 'https://evmtestnet.confluxrpc.com', explorer: 'https://evmtestnet.confluxscan.io', currency: 'CFX', rpcAlternatives: [] },
          { id: 'mainnet', label: 'Conflux eSpace Mainnet', chainId: 1030, defaultRpc: 'https://evm.confluxrpc.com', explorer: 'https://evm.confluxscan.io', currency: 'CFX', rpcAlternatives: [] },
        ]

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-text-dim">
        Network
        <Tooltip content="eSpace mainnet chainId 1030, testnet 71. Must match your Hardhat network and MetaMask before deploy." />
      </h2>

      <div className="flex rounded-md border border-border bg-surface-2 p-0.5">
        {options.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => onNetworkChange(n.id)}
            className={`flex-1 rounded px-3 py-2 text-sm font-medium transition-colors active:scale-[0.98] ${
              network === n.id
                ? 'bg-surface-1 text-text shadow-sm'
                : 'text-text-muted hover:text-text'
            }`}
          >
            {n.id === 'testnet' ? 'Testnet' : 'Mainnet'}
            <span className="ml-1.5 font-mono text-xs text-text-dim">{n.chainId}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="space-y-1 text-xs">
          <p className="text-text-muted">
            Explorer{' '}
            <a
              href={selected.explorer}
              target="_blank"
              rel="noreferrer"
              className="text-accent hover:underline"
            >
              ConfluxScan
            </a>
            <Tooltip content="Block explorer for contract verification and transaction lookup on eSpace." />
          </p>
          <p className="truncate font-mono text-[11px] text-text-dim">{selected.defaultRpc}</p>
        </div>
      )}

      <button
        type="button"
        onClick={() => setAdvancedOpen(!advancedOpen)}
        className="flex w-full items-center justify-between text-xs text-text-muted transition-colors hover:text-text"
      >
        <span className="flex items-center gap-1.5">
          Advanced RPC override
          <Tooltip content={`Override the default public RPC. See ${LINKS.rpcProviders} for provider list.`} />
        </span>
        <CaretDown
          size={12}
          className={`transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {advancedOpen && (
        <input
          type="url"
          value={rpcUrl}
          onChange={(e) => onRpcChange(e.target.value)}
          placeholder={selected?.defaultRpc ?? 'https://evmtestnet.confluxrpc.com'}
          className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 font-mono text-xs text-text outline-none transition-colors focus:border-accent"
        />
      )}
    </section>
  )
}
