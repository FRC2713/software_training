import { useEffect, useState } from 'react'
import { EditorView } from '@uiw/react-codemirror'

// Shared CodeMirror styling + dark-mode detection, used by both the runnable
// playground (PythonRunner) and the read-only prose examples (CodeBlock) so the
// two always look identical.

export function usePrefersDark() {
  const [dark, setDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return dark
}

// Blend the editor into the surrounding lesson card: transparent background,
// comfortable line height, and a font size that matches the prose.
export const editorTheme = EditorView.theme({
  '&': { backgroundColor: 'transparent', fontSize: '15px' },
  '.cm-gutters': { backgroundColor: 'transparent', border: 'none' },
  '.cm-content': { padding: '12px 0' },
  '.cm-line': { padding: '0 4px' },
  '&.cm-focused': { outline: 'none' },
})
