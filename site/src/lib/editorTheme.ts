import { useEffect, useState } from 'react'
import { EditorView } from '@uiw/react-codemirror'

// Shared CodeMirror styling + dark-mode detection, used by both the runnable
// playground (JavaRunner) and the read-only prose examples (CodeBlock) so both
// sit cleanly on the 2713 surface tokens without oneDark's blue-grey background.

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

// Blend the editor into the surrounding lesson surface: transparent background
// overrides oneDark's #282c34 canvas, keeping comfortable line height and mono font.
export const editorTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent !important',
    fontSize: '14.5px',
    fontFamily: 'var(--hawk-figure-font)',
  },
  '.cm-scroller': {
    backgroundColor: 'transparent !important',
    fontFamily: 'var(--hawk-figure-font)',
    lineHeight: '1.55',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent !important',
    border: 'none',
    color: 'var(--muted-foreground)',
  },
  '.cm-activeLine': {
    backgroundColor: 'color-mix(in srgb, var(--foreground) 5%, transparent) !important',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent !important',
    color: 'var(--foreground)',
  },
  '.cm-content': { padding: '12px 0' },
  '.cm-line': { padding: '0 8px' },
  '&.cm-focused': { outline: 'none' },
})
