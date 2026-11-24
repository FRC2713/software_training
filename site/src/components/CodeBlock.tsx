import { useMemo } from 'react'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { java } from '@codemirror/lang-java'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import { editorTheme, usePrefersDark } from '@/lib/editorTheme'

// A read-only, syntax-highlighted rendering of a fenced code block in the prose.
// Python and Java blocks get language highlighting + line numbers; other fences
// (e.g. ```text``` output samples) get the same themed surface without either.
export function CodeBlock({ code, language }: { code: string; language?: string }) {
  const dark = usePrefersDark()
  const isJava = language === 'java'
  const isPython = language === 'python'
  const isCode = isJava || isPython

  const extensions = useMemo(() => {
    const ext = [editorTheme, EditorView.lineWrapping]
    if (isPython) ext.unshift(python())
    else if (isJava) ext.unshift(java())
    return ext
  }, [isJava, isPython])

  return (
    <div className="my-4 overflow-hidden rounded-lg border bg-muted">
      <CodeMirror
        value={code}
        editable={false}
        extensions={extensions}
        theme={dark ? oneDark : 'light'}
        basicSetup={{
          lineNumbers: isCode,
          foldGutter: false,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
          autocompletion: false,
        }}
      />
    </div>
  )
}
