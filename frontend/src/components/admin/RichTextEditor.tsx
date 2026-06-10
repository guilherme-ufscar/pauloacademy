'use client'
import { useEffect, useRef } from 'react'

interface Props {
  value: string
  onChange: (val: string) => void
}

export default function RichTextEditor({ value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || ''
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const exec = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val)
    if (ref.current) onChange(ref.current.innerHTML)
  }

  const buttons = [
    { label: 'B', title: 'Negrito', cmd: 'bold', style: 'font-bold' },
    { label: 'I', title: 'Itálico', cmd: 'italic', style: 'italic' },
    { label: 'H2', title: 'Título 2', cmd: 'formatBlock', val: 'h2' },
    { label: 'H3', title: 'Título 3', cmd: 'formatBlock', val: 'h3' },
    { label: '¶', title: 'Parágrafo', cmd: 'formatBlock', val: 'p' },
    { label: '• Lista', title: 'Lista com marcadores', cmd: 'insertUnorderedList' },
    { label: '1. Lista', title: 'Lista numerada', cmd: 'insertOrderedList' },
  ]

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-200">
        {buttons.map(b => (
          <button
            key={b.cmd + (b.val || '')}
            type="button"
            title={b.title}
            onMouseDown={e => { e.preventDefault(); exec(b.cmd, b.val) }}
            className={`px-3 py-1 text-xs rounded border border-gray-200 hover:bg-white hover:shadow-sm transition-all ${b.style || ''}`}
          >
            {b.label}
          </button>
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        className="min-h-[200px] p-4 text-sm focus:outline-none prose-content"
        onInput={() => { if (ref.current) onChange(ref.current.innerHTML) }}
        suppressContentEditableWarning
      />
    </div>
  )
}
