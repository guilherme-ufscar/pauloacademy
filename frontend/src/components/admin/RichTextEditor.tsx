'use client'
import { useEffect, useRef, useCallback } from 'react'
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Link2, Image, Undo2, Redo2,
  Heading1, Heading2, Heading3, Pilcrow, Loader2
} from 'lucide-react'
import { useState } from 'react'
import api from '@/lib/api'

interface Props {
  value: string
  onChange: (val: string) => void
}

export default function RichTextEditor({ value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const savedRange = useRef<Range | null>(null)

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || ''
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const saveSelection = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      savedRange.current = sel.getRangeAt(0)
    }
  }

  const restoreSelection = () => {
    const sel = window.getSelection()
    if (sel && savedRange.current) {
      sel.removeAllRanges()
      sel.addRange(savedRange.current)
    }
  }

  const exec = useCallback((cmd: string, val?: string) => {
    ref.current?.focus()
    document.execCommand(cmd, false, val)
    if (ref.current) onChange(ref.current.innerHTML)
  }, [onChange])

  const insertLink = () => {
    saveSelection()
    const url = window.prompt('URL do link:', 'https://')
    if (!url) return
    restoreSelection()
    exec('createLink', url)
    // Open in new tab
    const links = ref.current?.querySelectorAll('a')
    links?.forEach(a => { a.target = '_blank'; a.rel = 'noopener noreferrer' })
    if (ref.current) onChange(ref.current.innerHTML)
  }

  const insertImageByUrl = () => {
    saveSelection()
    const url = window.prompt('URL da imagem:')
    if (!url) return
    restoreSelection()
    exec('insertHTML', `<img src="${url}" alt="" style="max-width:100%;height:auto;border-radius:8px;margin:8px 0;" />`)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      const url = r.data.url
      ref.current?.focus()
      restoreSelection()
      exec('insertHTML', `<img src="${url}" alt="${file.name}" style="max-width:100%;height:auto;border-radius:8px;margin:8px 0;" />`)
    } catch {
      window.alert('Erro ao enviar imagem. Tente colar a URL diretamente.')
    } finally {
      setUploading(false)
    }
  }

  type BtnDef =
    | { type: 'cmd'; icon: React.ReactNode; title: string; cmd: string; val?: string }
    | { type: 'sep' }
    | { type: 'fn'; icon: React.ReactNode; title: string; fn: () => void }

  const toolbar: BtnDef[] = [
    { type: 'cmd', icon: <Undo2 size={14} />, title: 'Desfazer', cmd: 'undo' },
    { type: 'cmd', icon: <Redo2 size={14} />, title: 'Refazer', cmd: 'redo' },
    { type: 'sep' },
    { type: 'cmd', icon: <Bold size={14} />, title: 'Negrito', cmd: 'bold' },
    { type: 'cmd', icon: <Italic size={14} />, title: 'Itálico', cmd: 'italic' },
    { type: 'cmd', icon: <Underline size={14} />, title: 'Sublinhado', cmd: 'underline' },
    { type: 'cmd', icon: <Strikethrough size={14} />, title: 'Tachado', cmd: 'strikeThrough' },
    { type: 'sep' },
    { type: 'cmd', icon: <Heading1 size={14} />, title: 'Título 1', cmd: 'formatBlock', val: 'h1' },
    { type: 'cmd', icon: <Heading2 size={14} />, title: 'Título 2', cmd: 'formatBlock', val: 'h2' },
    { type: 'cmd', icon: <Heading3 size={14} />, title: 'Título 3', cmd: 'formatBlock', val: 'h3' },
    { type: 'cmd', icon: <Pilcrow size={14} />, title: 'Parágrafo', cmd: 'formatBlock', val: 'p' },
    { type: 'sep' },
    { type: 'cmd', icon: <AlignLeft size={14} />, title: 'Alinhar à esquerda', cmd: 'justifyLeft' },
    { type: 'cmd', icon: <AlignCenter size={14} />, title: 'Centralizar', cmd: 'justifyCenter' },
    { type: 'cmd', icon: <AlignRight size={14} />, title: 'Alinhar à direita', cmd: 'justifyRight' },
    { type: 'sep' },
    { type: 'cmd', icon: <List size={14} />, title: 'Lista com marcadores', cmd: 'insertUnorderedList' },
    { type: 'cmd', icon: <ListOrdered size={14} />, title: 'Lista numerada', cmd: 'insertOrderedList' },
    { type: 'sep' },
    { type: 'fn', icon: <Link2 size={14} />, title: 'Inserir link', fn: insertLink },
    { type: 'fn', icon: uploading ? <Loader2 size={14} className="animate-spin" /> : <Image size={14} />, title: 'Enviar imagem do computador', fn: () => { saveSelection(); fileRef.current?.click() } },
    { type: 'fn', icon: <span className="text-xs font-bold">URL</span>, title: 'Inserir imagem por URL', fn: insertImageByUrl },
  ]

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      <div className="flex flex-wrap gap-0.5 p-2 bg-gray-50 border-b border-gray-200">
        {toolbar.map((item, i) => {
          if (item.type === 'sep') {
            return <div key={i} className="w-px bg-gray-300 mx-1 self-stretch" />
          }
          const handler = item.type === 'cmd'
            ? (e: React.MouseEvent) => { e.preventDefault(); exec(item.cmd, item.val) }
            : (e: React.MouseEvent) => { e.preventDefault(); item.fn() }
          return (
            <button
              key={i}
              type="button"
              title={item.title}
              onMouseDown={handler}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all text-gray-700"
            >
              {item.icon}
            </button>
          )
        })}
      </div>
      <div
        ref={ref}
        contentEditable
        className="min-h-[220px] p-4 text-sm focus:outline-none prose-content"
        onInput={() => { if (ref.current) onChange(ref.current.innerHTML) }}
        onMouseUp={saveSelection}
        onKeyUp={saveSelection}
        suppressContentEditableWarning
      />
    </div>
  )
}
