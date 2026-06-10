'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Props {
  value?: string
  onChange: (url: string) => void
  label?: string
}

export default function ImageUpload({ value, onChange, label = 'Imagem' }: Props) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const r = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onChange(r.data.url)
      toast.success('Imagem enviada!')
    } catch {
      toast.error('Erro ao fazer upload')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div
        className={`relative border-2 border-dashed rounded-xl transition-all ${value ? 'border-primary-300' : 'border-gray-200 hover:border-primary-300'}`}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        {value ? (
          <div className="relative h-48 rounded-xl overflow-hidden">
            <Image src={value} alt="Upload" fill className="object-cover" />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div
            className="h-32 flex flex-col items-center justify-center gap-2 cursor-pointer text-gray-400 hover:text-primary-600 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <Loader2 size={32} className="animate-spin text-primary-500" />
            ) : (
              <>
                <ImageIcon size={32} />
                <div className="text-center">
                  <p className="text-sm font-medium">Clique ou arraste uma imagem</p>
                  <p className="text-xs text-gray-300">PNG, JPG, WEBP até 20MB</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
      {!value && (
        <div className="mt-2">
          <label className="label text-xs">ou cole a URL da imagem</label>
          <input
            type="url"
            className="input text-xs"
            placeholder="https://..."
            onChange={e => onChange(e.target.value)}
          />
        </div>
      )}
    </div>
  )
}
