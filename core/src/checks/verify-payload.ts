import type { CheckResult } from '../types.js'

/** ConfluxScan verify quirks documented in conflux-skills #5 */
export type VerifyPayloadInput = {
  compilerVersion?: string
  evmVersion?: string
  optimizationUsed?: boolean | string
  runs?: number | string
  sourceCode?: string
  contractName?: string
  constructorArguments?: string
  codeFormat?: string
}

export function lintVerifyPayload(input: VerifyPayloadInput): CheckResult[] {
  const results: CheckResult[] = []

  if (!input.compilerVersion?.trim()) {
    results.push({
      id: 'verify-compiler',
      name: 'Compiler version',
      status: 'fail',
      message: 'compilerVersion is required',
      detail: 'Must match the exact solc version used to compile deployment artifacts.',
    })
  } else if (!input.compilerVersion.startsWith('v')) {
    results.push({
      id: 'verify-compiler',
      name: 'Compiler version',
      status: 'warn',
      message: `compilerVersion "${input.compilerVersion}" — ConfluxScan usually expects format v0.8.24+commit...`,
    })
  } else {
    results.push({
      id: 'verify-compiler',
      name: 'Compiler version',
      status: 'pass',
      message: `compilerVersion set (${input.compilerVersion})`,
    })
  }

  const evm = (input.evmVersion ?? '').trim().toLowerCase()
  if (evm === 'default' || evm === 'Default') {
    results.push({
      id: 'verify-evmversion',
      name: 'EVM version field',
      status: 'fail',
      message: 'evmversion=default is rejected by ConfluxScan',
      detail: 'Omit evmversion entirely unless you used a concrete version (e.g. cancun, paris). See conflux-skills issue #5.',
    })
  } else if (evm) {
    results.push({
      id: 'verify-evmversion',
      name: 'EVM version field',
      status: 'pass',
      message: `evmversion: ${input.evmVersion}`,
    })
  } else {
    results.push({
      id: 'verify-evmversion',
      name: 'EVM version field',
      status: 'pass',
      message: 'evmversion omitted (recommended when using compiler default)',
    })
  }

  if (input.optimizationUsed === undefined) {
    results.push({
      id: 'verify-optimizer',
      name: 'Optimizer flag',
      status: 'warn',
      message: 'optimizationUsed not specified — must match artifact settings exactly',
    })
  } else {
    results.push({
      id: 'verify-optimizer',
      name: 'Optimizer flag',
      status: 'pass',
      message: `optimizationUsed: ${input.optimizationUsed}`,
      detail: input.runs != null ? `runs: ${input.runs}` : undefined,
    })
  }

  if (!input.sourceCode?.trim() && !input.contractName?.trim()) {
    results.push({
      id: 'verify-source',
      name: 'Source / contract name',
      status: 'warn',
      message: 'No sourceCode or contractName — provide flattened source or standard-json for verify',
    })
  } else {
    results.push({
      id: 'verify-source',
      name: 'Source / contract name',
      status: 'pass',
      message: input.contractName ? `contractName: ${input.contractName}` : 'sourceCode present',
    })
  }

  results.push({
    id: 'verify-bytecode-tip',
    name: 'Bytecode alignment',
    status: 'skip',
    message: 'Advisory: compare creation bytecode to on-chain code before ConfluxScan verify',
    detail:
      'Not auto-checked yet. Deploy and verify must use the same compiler version, optimizer runs, and evm settings. Hardhat config alone is not proof.',
  })

  return results
}

export function lintVerifyPayloadJson(raw: string): { ok: boolean; checks: CheckResult[]; error?: string } {
  try {
    const parsed = JSON.parse(raw) as VerifyPayloadInput
    const checks = lintVerifyPayload(parsed)
    const ok = checks.every((c) => c.status !== 'fail')
    return { ok, checks }
  } catch (e) {
    return {
      ok: false,
      checks: [],
      error: e instanceof Error ? e.message : 'Invalid JSON',
    }
  }
}
