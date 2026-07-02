'use client'
import { useEffect, useRef, useCallback } from 'react'
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Link2, Image, Undo2, Redo2, Loader2,
  Baseline, Highlighter
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
      // clone: getRangeAt retorna um range vivo que colapsaria ao focar o editor,
      // fazendo cor/tamanho serem aplicados a uma seleção vazia.
      savedRange.current = sel.getRangeAt(0).cloneRange()
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

  // Aplica um comando reaproveitando a seleção salva (usado por selects e color pickers,
  // pois clicar neles tira o foco do editor e perde a seleção original).
  const execSaved = (fn: () => void) => {
    ref.current?.focus()
    restoreSelection()
    fn()
    if (ref.current) onChange(ref.current.innerHTML)
  }

  const applyColor = (cmd: string, color: string) => execSaved(() => {
    document.execCommand('styleWithCSS', false, 'true')
    document.execCommand(cmd, false, color)
    document.execCommand('styleWithCSS', false, 'false')
  })

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

  const STYLE_OPTIONS = [
    { label: 'Parágrafo', val: 'p' },
    { label: 'Título 1', val: 'h1' },
    { label: 'Título 2', val: 'h2' },
    { label: 'Título 3', val: 'h3' },
  ]

  const FONT_FAMILIES = [
    { label: 'Fonte padrão', val: '' },
    { label: 'Arial', val: 'Arial, sans-serif' },
    { label: 'Georgia', val: 'Georgia, serif' },
    { label: 'Times New Roman', val: '"Times New Roman", serif' },
    { label: 'Courier New', val: '"Courier New", monospace' },
    { label: 'Verdana', val: 'Verdana, sans-serif' },
  ]

  // fontSize do execCommand aceita 1–7 (tamanhos crescentes)
  const FONT_SIZES = [
    { label: 'Pequeno', val: '2' },
    { label: 'Normal', val: '3' },
    { label: 'Médio', val: '4' },
    { label: 'Grande', val: '5' },
    { label: 'Muito grande', val: '6' },
    { label: 'Enorme', val: '7' },
  ]

  const formatRow: BtnDef[] = [
    { type: 'cmd', icon: <Bold size={14} />, title: 'Negrito', cmd: 'bold' },
    { type: 'cmd', icon: <Italic size={14} />, title: 'Itálico', cmd: 'italic' },
    { type: 'cmd', icon: <Underline size={14} />, title: 'Sublinhado', cmd: 'underline' },
    { type: 'cmd', icon: <Strikethrough size={14} />, title: 'Tachado', cmd: 'strikeThrough' },
    { type: 'sep' },
    { type: 'cmd', icon: <AlignLeft size={14} />, title: 'Alinhar à esquerda', cmd: 'justifyLeft' },
    { type: 'cmd', icon: <AlignCenter size={14} />, title: 'Centralizar', cmd: 'justifyCenter' },
    { type: 'cmd', icon: <AlignRight size={14} />, title: 'Alinhar à direita', cmd: 'justifyRight' },
    { type: 'cmd', icon: <AlignJustify size={14} />, title: 'Justificar', cmd: 'justifyFull' },
    { type: 'sep' },
    { type: 'cmd', icon: <List size={14} />, title: 'Lista com marcadores', cmd: 'insertUnorderedList' },
    { type: 'cmd', icon: <ListOrdered size={14} />, title: 'Lista numerada', cmd: 'insertOrderedList' },
    { type: 'sep' },
    { type: 'fn', icon: <Link2 size={14} />, title: 'Inserir link', fn: insertLink },
    { type: 'fn', icon: uploading ? <Loader2 size={14} className="animate-spin" /> : <Image size={14} />, title: 'Enviar imagem do computador', fn: () => { saveSelection(); fileRef.current?.click() } },
    { type: 'fn', icon: <span className="text-xs font-bold">URL</span>, title: 'Inserir imagem por URL', fn: insertImageByUrl },
  ]

  const selectClass = 'h-8 px-2 rounded border border-gray-200 bg-white text-sm text-gray-700 hover:border-gray-300 focus:outline-none'

  const renderBtn = (item: BtnDef, i: number) => {
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
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        <button
          type="button"
          title="Desfazer"
          onMouseDown={e => { e.preventDefault(); exec('undo') }}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all text-gray-700"
        >
          <Undo2 size={14} />
        </button>
        <button
          type="button"
          title="Refazer"
          onMouseDown={e => { e.preventDefault(); exec('redo') }}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all text-gray-700"
        >
          <Redo2 size={14} />
        </button>
        <div className="w-px bg-gray-300 mx-1 self-stretch" />
        <select
          title="Estilo do texto"
          defaultValue="p"
          onMouseDown={saveSelection}
          onChange={e => { restoreSelection(); exec('formatBlock', e.target.value); e.target.value = 'p' }}
          className={selectClass}
        >
          {STYLE_OPTIONS.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
        </select>
        <select
          title="Fonte"
          defaultValue=""
          onMouseDown={saveSelection}
          onChange={e => { const v = e.target.value; e.target.value = ''; if (v) execSaved(() => document.execCommand('fontName', false, v)) }}
          className={selectClass}
        >
          {FONT_FAMILIES.map(o => <option key={o.label} value={o.val}>{o.label}</option>)}
        </select>
        <select
          title="Tamanho da fonte"
          defaultValue="3"
          onMouseDown={saveSelection}
          onChange={e => { const v = e.target.value; e.target.value = '3'; execSaved(() => document.execCommand('fontSize', false, v)) }}
          className={selectClass}
        >
          {FONT_SIZES.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        {formatRow.map(renderBtn)}
        <div className="w-px bg-gray-300 mx-1 self-stretch" />
        <label
          title="Cor do texto"
          onMouseDown={saveSelection}
          className="relative w-8 h-8 flex items-center justify-center rounded hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all text-gray-700 cursor-pointer"
        >
          <Baseline size={14} />
          <input
            type="color"
            defaultValue="#000000"
            onChange={e => applyColor('foreColor', e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
        <label
          title="Cor de destaque (marca-texto)"
          onMouseDown={saveSelection}
          className="relative w-8 h-8 flex items-center justify-center rounded hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all text-gray-700 cursor-pointer"
        >
          <Highlighter size={14} />
          <input
            type="color"
            defaultValue="#ffff00"
            onChange={e => applyColor('hiliteColor', e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>
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
