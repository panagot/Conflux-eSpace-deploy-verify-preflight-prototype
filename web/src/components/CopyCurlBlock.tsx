import { useState } from 'react'
import { CopySimple, Check } from '@phosphor-icons/react'

const LIVE_ORIGIN = 'https://conflux-e-space-deploy-verify-prefl-gamma.vercel.app'

export const DOCTOR_CURL = `curl -sS -X POST \\
  ${LIVE_ORIGIN}/api/doctor \\
  -H "Content-Type: application/json" \\
  -d '{"network":"testnet","verifyPayload":{"compilerVersion":"v0.8.24+commit.e11b9ed9","optimizationUsed":true,"runs":200,"contractName":"MyToken","evmVersion":"default"}}'`

export function CopyCurlBlock({
  title = 'Copy-paste /api/doctor',
  command = DOCTOR_CURL,
}: {
  title?: string
  command?: string
}) {
  const [copied, setCopied] = useState(false)

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(command.replace(/\\\n/g, '').replace(/\s+/g, ' ').trim())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface-0">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-dim">{title}</p>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 font-mono text-[10px] text-text-muted transition-colors hover:border-accent/40 hover:text-accent"
        >
          {copied ? <Check size={12} className="text-pass" /> : <CopySimple size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto px-3 py-3 font-mono text-[11px] leading-relaxed text-text-muted">
        {command}
      </pre>
      <p className="border-t border-border px-3 py-2 text-[11px] text-text-dim">
        Expect <code className="text-warn">ready: false</code> — sample includes{' '}
        <code className="text-warn">evmVersion: &quot;default&quot;</code>.
      </p>
    </div>
  )
}
