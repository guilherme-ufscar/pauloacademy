'use client'
import { useState } from 'react'
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react'

export interface CurriculumDiscipline { name: string; order_index: number }
export interface CurriculumModule { name: string; workload: number; order_index: number; disciplines: CurriculumDiscipline[] }

interface Props {
  value: CurriculumModule[]
  onChange: (modules: CurriculumModule[]) => void
}

export default function CurriculumEditor({ value, onChange }: Props) {
  const [expanded, setExpanded] = useState<number[]>([0])

  const addModule = () => {
    const newMod: CurriculumModule = { name: '', workload: 0, order_index: value.length, disciplines: [] }
    onChange([...value, newMod])
    setExpanded(e => [...e, value.length])
  }

  const removeModule = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i).map((m, idx) => ({ ...m, order_index: idx })))
    setExpanded(e => e.filter(x => x !== i).map(x => x > i ? x - 1 : x))
  }

  const updateModule = (i: number, patch: Partial<Module>) => {
    onChange(value.map((m, idx) => idx === i ? { ...m, ...patch } : m))
  }

  const addDiscipline = (mi: number) => {
    const mods = [...value]
    mods[mi] = { ...mods[mi], disciplines: [...(mods[mi].disciplines || []), { name: '', order_index: (mods[mi].disciplines?.length || 0) }] }
    onChange(mods)
    if (!expanded.includes(mi)) setExpanded(e => [...e, mi])
  }

  const removeDiscipline = (mi: number, di: number) => {
    const mods = [...value]
    mods[mi] = { ...mods[mi], disciplines: mods[mi].disciplines.filter((_, idx) => idx !== di).map((d, idx) => ({ ...d, order_index: idx })) }
    onChange(mods)
  }

  const updateDiscipline = (mi: number, di: number, name: string) => {
    const mods = [...value]
    mods[mi].disciplines[di] = { ...mods[mi].disciplines[di], name }
    onChange(mods)
  }

  const moveModule = (i: number, dir: -1 | 1) => {
    const ni = i + dir
    if (ni < 0 || ni >= value.length) return
    const mods = [...value]
    ;[mods[i], mods[ni]] = [mods[ni], mods[i]]
    onChange(mods.map((m, idx) => ({ ...m, order_index: idx })))
  }

  const toggle = (i: number) => setExpanded(e => e.includes(i) ? e.filter(x => x !== i) : [...e, i])

  return (
    <div className="space-y-3">
      {value.map((mod, mi) => (
        <div key={mi} className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-3 bg-gray-50">
            <GripVertical size={16} className="text-gray-300 cursor-grab" />
            <div className="flex gap-1">
              <button type="button" onClick={() => moveModule(mi, -1)} disabled={mi === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                <ChevronUp size={14} />
              </button>
              <button type="button" onClick={() => moveModule(mi, 1)} disabled={mi === value.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                <ChevronDown size={14} />
              </button>
            </div>
            <div className="flex-1 grid grid-cols-3 gap-2">
              <input
                value={mod.name}
                onChange={e => updateModule(mi, { name: e.target.value })}
                className="input col-span-2 text-sm py-1.5"
                placeholder={`Módulo ${mi + 1} – Nome`}
              />
              <input
                type="number"
                value={mod.workload || ''}
                onChange={e => updateModule(mi, { workload: Number(e.target.value) })}
                className="input text-sm py-1.5"
                placeholder="Horas"
              />
            </div>
            <button type="button" onClick={() => toggle(mi)} className="p-1.5 text-gray-500 hover:text-primary-600">
              {expanded.includes(mi) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <button type="button" onClick={() => removeModule(mi)} className="p-1.5 text-gray-400 hover:text-red-500">
              <Trash2 size={16} />
            </button>
          </div>

          {expanded.includes(mi) && (
            <div className="p-3 space-y-2">
              {(mod.disciplines || []).map((d, di) => (
                <div key={di} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-accent-400 rounded-full shrink-0" />
                  <input
                    value={d.name}
                    onChange={e => updateDiscipline(mi, di, e.target.value)}
                    className="input flex-1 text-sm py-1.5"
                    placeholder={`Disciplina ${di + 1}`}
                  />
                  <button type="button" onClick={() => removeDiscipline(mi, di)} className="p-1 text-gray-300 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addDiscipline(mi)}
                      className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 mt-2">
                <Plus size={14} /> Adicionar disciplina
              </button>
            </div>
          )}
        </div>
      ))}

      <button type="button" onClick={addModule}
              className="flex items-center gap-2 w-full border-2 border-dashed border-gray-200 rounded-xl p-3 text-sm text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-all">
        <Plus size={16} /> Adicionar módulo
      </button>
    </div>
  )
}
