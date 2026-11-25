import { useMemo } from 'react'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import { editorTheme, usePrefersDark } from '@/lib/editorTheme'

// A read-only, syntax-highlighted rendering of a fenced code block in the prose.
// Python blocks get language highlighting + line numbers; other fences (e.g.
// ```text``` output samples) get the same themed surface without either.
export function CodeBlock({ code, language }: { code: string; language?: string }) {
  const dark = usePrefersDark()
  const isPython = language === 'python'
  const label = isPython ? 'Python example' : language ? `${language} example` : 'Output'

  const extensions = useMemo(() => {
    const ext = [editorTheme, EditorView.lineWrapping]
    if (isPython) ext.unshift(python())
    return ext
  }, [isPython])

  return (
    <div className="not-prose my-4 overflow-hidden rounded-lg border border-border bg-[var(--code-bg)]">
      <div className="border-b border-border bg-muted px-3 py-1.5">
        <span className="brand-subheading text-[11px] uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <CodeMirror
        value={code}
        editable={false}
        extensions={extensions}
        theme={dark ? oneDark : 'light'}
        basicSetup={{
          lineNumbers: isPython,
          foldGutter: false,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
          autocompletion: false,
        }}
      />
    </div>
  )
}
