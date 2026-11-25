import { cpp } from "@codemirror/lang-cpp"
import { java } from "@codemirror/lang-java"
import { javascript } from "@codemirror/lang-javascript"
import { python } from "@codemirror/lang-python"
import { Prec } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import CodeMirror, { type Extension } from "@uiw/react-codemirror"
import { useMemo } from "react"

const LANG_EXTENSIONS: Record<string, () => Extension> = {
  python: () => python(),
  javascript: () => javascript(),
  typescript: () => javascript({ typescript: true }),
  java: () => java(),
  cpp: () => cpp(),
  c: () => cpp(),
}

// Matches design.md: editor surface #17191F, JetBrains Mono, orange cursor.
// Prec.highest so it wins over the base dark theme (which supplies syntax colors).
const clashTheme = Prec.highest(EditorView.theme(
  {
    "&": { backgroundColor: "#17191F", fontSize: "13.5px", height: "100%" },
    ".cm-scroller": { fontFamily: '"JetBrains Mono", ui-monospace, monospace', lineHeight: "1.65" },
    ".cm-gutters": { backgroundColor: "#17191F", borderRight: "1px solid #262930", color: "#686B75" },
    ".cm-activeLine": { backgroundColor: "rgba(255,255,255,0.03)" },
    ".cm-activeLineGutter": { backgroundColor: "rgba(255,255,255,0.04)", color: "#A1A1AA" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#F97316", borderLeftWidth: "2px" },
    "&.cm-focused": { outline: "none" },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
      backgroundColor: "rgba(249,115,22,0.25) !important",
    },
  },
  { dark: true },
))

type CodeEditorProps = {
  value: string
  onChange: (value: string) => void
  languageKey: string
  height?: string
  minHeight?: string
  ariaLabel?: string
  readOnly?: boolean
}

export function CodeEditor({
  value,
  onChange,
  languageKey,
  height = "100%",
  minHeight,
  ariaLabel = "Code editor",
  readOnly,
}: CodeEditorProps) {
  const extensions = useMemo(
    () => [clashTheme, (LANG_EXTENSIONS[languageKey] ?? LANG_EXTENSIONS.python)(), EditorView.lineWrapping],
    [languageKey],
  )

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      theme="dark"
      extensions={extensions}
      height={height}
      minHeight={minHeight}
      readOnly={readOnly}
      aria-label={ariaLabel}
      basicSetup={{ tabSize: 4, foldGutter: false, highlightActiveLine: true }}
      style={{ height }}
    />
  )
}
