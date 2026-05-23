import { useState } from 'react'
import { Camera, X } from 'lucide-react'
import { Button } from '../../design-system'
import { resizeImage } from '../../utils/imageUpload'

export function ImageUpload({ value, onChange, shape = 'rectangle', aspectRatio = '1:1', maxSizeMB = 2, placeholder = 'Enviar imagem' }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const processFile = async (file) => {
    if (!file) return
    try {
      setError('')
      setLoading(true)
      const image = await resizeImage(file, aspectRatio === '16:9' ? 1200 : 800, 0.82)
      onChange(image)
    } catch (err) {
      setError(err.message || 'Nao foi possivel carregar a imagem.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-2">
      <label className={`group relative grid cursor-pointer place-items-center overflow-hidden border border-dashed border-[var(--border-default)] bg-[var(--bg-subtle)] transition hover:border-[var(--accent-default)] ${shape === 'circle' ? 'aspect-square rounded-full' : 'rounded-[var(--radius-md)]'} ${aspectRatio === '16:9' ? 'aspect-video' : aspectRatio === '4:3' ? 'aspect-[4/3]' : 'aspect-square'}`}>
        {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : (
          <span className="flex flex-col items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
            <Camera className="h-5 w-5" />
            {loading ? 'Processando...' : placeholder}
          </span>
        )}
        <input type="file" accept="image/png,image/jpeg" className="sr-only" onChange={(event) => processFile(event.target.files?.[0])} />
      </label>
      {value ? <Button type="button" variant="secondary" size="sm" onClick={() => onChange(null)}><X className="h-4 w-4" /> Remover</Button> : null}
      {error ? <p className="text-sm text-[var(--status-cancelled)]">{error}</p> : null}
    </div>
  )
}
