import { useCallback, useEffect, useState } from 'react'
import type { CheckResult, DoctorReport, NetworkInfo } from '../types'

export const SAMPLE_PAYLOAD = `{
  "compilerVersion": "v0.8.24+commit.e11b9ed9",
  "optimizationUsed": true,
  "runs": 200,
  "contractName": "MyToken",
  "evmVersion": "default"
}`

export function useDoctor() {
  const [networks, setNetworks] = useState<NetworkInfo[]>([])
  const [network, setNetwork] = useState('testnet')
  const [rpcUrl, setRpcUrl] = useState('')
  const [payloadRaw, setPayloadRaw] = useState(SAMPLE_PAYLOAD)
  const [includePayload, setIncludePayload] = useState(true)
  const [report, setReport] = useState<DoctorReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'doctor' | 'payload'>('doctor')
  const [jsonError, setJsonError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/networks')
      .then((r) => r.json())
      .then((data: { networks: NetworkInfo[] }) => setNetworks(data.networks))
      .catch(() => setError('API unreachable — start server on :8792'))
  }, [])

  const selected = networks.find((n) => n.id === network)

  const validateJson = useCallback((raw: string): boolean => {
    try {
      JSON.parse(raw)
      setJsonError(null)
      return true
    } catch (e) {
      setJsonError(e instanceof Error ? e.message : 'Invalid JSON')
      return false
    }
  }, [])

  const runDoctor = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let verifyPayload: Record<string, unknown> | undefined
      if (includePayload && payloadRaw.trim()) {
        if (!validateJson(payloadRaw)) {
          setLoading(false)
          return
        }
        verifyPayload = JSON.parse(payloadRaw)
      }

      const res = await fetch('/api/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          network,
          rpcUrl: rpcUrl.trim() || undefined,
          verifyPayload,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? `HTTP ${res.status}`)
      }

      const data = (await res.json()) as DoctorReport
      setReport(data)
      setMode('doctor')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Run failed')
    } finally {
      setLoading(false)
    }
  }, [network, rpcUrl, payloadRaw, includePayload, validateJson])

  const lintOnly = useCallback(async () => {
    setLoading(true)
    setError(null)
    if (!validateJson(payloadRaw)) {
      setLoading(false)
      return
    }
    try {
      const res = await fetch('/api/lint-payload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw: payloadRaw }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setReport({
        network,
        rpcUrl: rpcUrl || selected?.defaultRpc || '',
        ranAt: new Date().toISOString(),
        summary: {
          pass: data.checks.filter((c: CheckResult) => c.status === 'pass').length,
          warn: data.checks.filter((c: CheckResult) => c.status === 'warn').length,
          fail: data.checks.filter((c: CheckResult) => c.status === 'fail').length,
          skip: data.checks.filter((c: CheckResult) => c.status === 'skip').length,
        },
        checks: data.checks,
        ready: data.ok,
      })
      setMode('payload')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lint failed')
    } finally {
      setLoading(false)
    }
  }, [network, rpcUrl, payloadRaw, selected, validateJson])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (!loading) runDoctor()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [loading, runDoctor])

  return {
    networks,
    network,
    setNetwork,
    rpcUrl,
    setRpcUrl,
    payloadRaw,
    setPayloadRaw,
    includePayload,
    setIncludePayload,
    report,
    loading,
    error,
    mode,
    jsonError,
    selected,
    runDoctor,
    lintOnly,
    validateJson,
  }
}
