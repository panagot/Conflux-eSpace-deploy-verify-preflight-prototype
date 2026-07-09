import { useEffect, useRef } from 'react'
import Editor, { type Monaco } from '@monaco-editor/react'
import type { editor } from 'monaco-editor'
import { Tooltip } from './Tooltip'
import { LINKS } from '../lib/links'

type Props = {
  value: string
  onChange: (value: string) => void
  jsonError: string | null
  includePayload: boolean
  onIncludeChange: (v: boolean) => void
}

function defineVerifyflowTheme(monaco: Monaco) {
  monaco.editor.defineTheme('verifyflow', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'string.key.json', foreground: '8ec8b8' },
      { token: 'string.value.json', foreground: 'c4d4e8' },
      { token: 'number.json', foreground: 'e8c468' },
    ],
    colors: {
      'editor.background': '#1a2438',
      'editor.foreground': '#e8edf5',
      'editorLineNumber.foreground': '#5c6b85',
      'editor.lineHighlightBackground': '#1f2d45',
      'editor.selectionBackground': '#2a4a5a55',
      'editor.inactiveSelectionBackground': '#2a4a5a33',
    },
  })
}

export function PayloadEditor({
  value,
  onChange,
  jsonError,
  includePayload,
  onIncludeChange,
}: Props) {
  const monacoRef = useRef<Monaco | null>(null)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const applyMarkers = (monaco: Monaco, ed: editor.IStandaloneCodeEditor) => {
    const model = ed.getModel()
    if (!model) return
    if (jsonError) {
      monaco.editor.setModelMarkers(model, 'json', [
        {
          severity: monaco.MarkerSeverity.Error,
          message: jsonError,
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: model.getLineCount(),
          endColumn: model.getLineMaxColumn(model.getLineCount()),
        },
      ])
    } else {
      monaco.editor.setModelMarkers(model, 'json', [])
    }
  }

  useEffect(() => {
    if (monacoRef.current && editorRef.current) {
      applyMarkers(monacoRef.current, editorRef.current)
    }
  }, [jsonError])

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-text-dim">
          Verify payload
          <Tooltip
            content={
              <>
                Fields submitted to ConfluxScan contract verification. Must match compiler output
                exactly. See{' '}
                <a href={LINKS.verifyContracts} target="_blank" rel="noreferrer" className="text-accent underline">
                  verify docs
                </a>
                .
              </>
            }
          />
        </h2>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-text-muted">
          <input
            type="checkbox"
            checked={includePayload}
            onChange={(e) => onIncludeChange(e.target.checked)}
            className="accent-accent"
          />
          Include in preflight
        </label>
      </div>

      <div
        className={`overflow-hidden rounded-md border ${
          jsonError ? 'border-fail' : 'border-border'
        }`}
      >
        <Editor
          height="220px"
          language="json"
          theme="verifyflow"
          value={value}
          onChange={(v) => onChange(v ?? '')}
          beforeMount={(monaco) => {
            monacoRef.current = monaco
            defineVerifyflowTheme(monaco)
          }}
          onMount={(ed, monaco) => {
            editorRef.current = ed
            monacoRef.current = monaco
            applyMarkers(monaco, ed)
          }}
          options={{
            minimap: { enabled: false },
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'line',
            bracketPairColorization: { enabled: true },
            automaticLayout: true,
          }}
        />
      </div>

      {jsonError && (
        <p className="font-mono text-[11px] text-fail">JSON parse error: {jsonError}</p>
      )}

      <p className="text-[11px] text-text-dim">
        Sample includes <code className="font-mono text-warn">evmVersion: &quot;default&quot;</code>{' '}
        — known ConfluxScan rejection.
      </p>
    </section>
  )
}
