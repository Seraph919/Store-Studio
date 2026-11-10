import './media-upload.css'
import { useState, type ChangeEvent } from 'react'
import { UploadCloud, Trash2, Loader2 } from 'lucide-react'
import { sellerApi } from '../services/sellerApi'

interface Props {
  label: string
  value?: string
  onChange: (url: string) => void
  help?: string
}

export function MediaUploadField({ label, value, onChange, help }: Props) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setBusy(true); setError('')
    try { onChange(await sellerApi.uploadFileToR2(file)) }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Upload failed') }
    finally { setBusy(false) }
  }
  return <div className="media-upload-field">
    <span className="media-upload-label">{label}</span>
    {help && <p className="text-xs text-slate-500">{help}</p>}
    {value && <img src={value} alt={`${label} preview`} className="media-upload-preview" />}
    <div className="media-upload-actions">
      <label className="media-upload-button">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
        {busy ? 'Uploading…' : value ? 'Replace photo' : 'Upload photo'}
        <input aria-label={label} type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={busy} onChange={upload} />
      </label>
      {value && <button type="button" disabled={busy} onClick={() => onChange('')} className="media-upload-remove"><Trash2 size={14} /> Remove</button>}
    </div>
    {error && <p className="text-xs text-red-600" role="alert">{error}</p>}
  </div>
}
