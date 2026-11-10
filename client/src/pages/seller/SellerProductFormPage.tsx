import { imageFrameStyle, imagePhotoStyle } from '../../storefront/components/ProductMediaFrame'
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Layers,
  Upload,
  Trash2,
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
} from 'lucide-react'
import { sellerApi } from '../../services/sellerApi'
import { productApi } from '../../services/productApi'
import { useCategoriesQuery } from '../../hooks/useStoreQueries'
import type { CreateProductRequest, Product } from '../../types'

export const SellerProductFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const numericId = id ? parseInt(id, 10) : undefined
  const isEditing = Boolean(numericId && !isNaN(numericId))
  const navigate = useNavigate()

  const { data: categories = [] } = useCategoriesQuery()

  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    description: '',
    price: 0,
    originalPrice: undefined,
    discountRate: undefined,
    quantity: 1,
    categoryId: undefined,
    categoryName: '',
    isPack: false,
    paymentMode: 'COD',
    depositPercent: undefined,
    isListed: true,
    videoUrl: '',
    images: [],
  })

  const [primaryImage, setPrimaryImage] = useState<string>('')
  const [hoverImage, setHoverImage] = useState<string>('')
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [imageAspect, setImageAspect] = useState<'square' | 'portrait' | 'landscape'>('square')
  const [imageFit, setImageFit] = useState<'cover' | 'contain'>('cover')
  const [imagePositionX, setImagePositionX] = useState(50)
  const [imagePositionY, setImagePositionY] = useState(50)
  const [imageZoom, setImageZoom] = useState(100)
  const framing = { imageAspect, imageFit, imagePositionX, imagePositionY, imageZoom }

  const [isLoading, setIsLoading] = useState<boolean>(isEditing)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (isEditing && numericId) {
      setIsLoading(true)
      productApi
        .getProductById(numericId)
        .then((product: Product) => {
          setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            originalPrice: product.originalPrice,
            discountRate: product.discountRate,
            quantity: product.quantity,
            categoryId: product.categoryId,
            categoryName: product.categoryName || '',
            isPack: Boolean(product.isPack),
            paymentMode: product.paymentMode ?? 'COD',
            depositPercent: product.depositPercent ?? undefined,
            isListed: product.isListed !== false,
            videoUrl: product.videoUrl || '',
            images: product.images || [],
          })
          setImageAspect(product.imageAspect ?? 'square')
          setImageFit(product.imageFit ?? 'cover')
          setImagePositionX(product.imagePositionX ?? 50)
          setImagePositionY(product.imagePositionY ?? 50)
          setImageZoom(product.imageZoom ?? 100)
          setPrimaryImage(product.thumbnailUrl || product.images?.[0] || '')
          setHoverImage(product.hoverImageUrl || product.images?.[1] || '')
          setAdditionalImages(Array.from(new Set([product.thumbnailUrl, product.hoverImageUrl, ...(product.images || [])].filter((url): url is string => Boolean(url)))))
          setIsLoading(false)
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to retrieve product details.')
          setIsLoading(false)
        })
    }
  }, [isEditing, numericId])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!files.length) return
    setIsUploading(true)
    setError(null)
    try {
      const urls: string[] = []
      for (const file of files) urls.push(await sellerApi.uploadFileToR2(file))
      setAdditionalImages(prev => Array.from(new Set([...prev, ...urls])))
      if (!primaryImage) setPrimaryImage(urls[0])
      if (!hoverImage) setHoverImage(urls.length > 1 ? urls[1] : (primaryImage ? urls[0] : ''))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Media upload failed.')
    } finally { setIsUploading(false) }
  }

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setIsUploadingVideo(true); setError(null)
    try {
      const videoUrl = await sellerApi.uploadFileToR2(file)
      setFormData(previous => ({ ...previous, videoUrl }))
    }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Video upload failed.') }
    finally { setIsUploadingVideo(false) }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    const removed = additionalImages[indexToRemove]
    setAdditionalImages(prev => prev.filter((_, idx) => idx !== indexToRemove))
    if (removed === primaryImage) setPrimaryImage(additionalImages.find((_, idx) => idx !== indexToRemove) ?? '')
    if (removed === hoverImage) setHoverImage('')
  }

  const resetFraming = () => {
    setImageAspect('square'); setImageFit('cover'); setImagePositionX(50); setImagePositionY(50); setImageZoom(100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (!formData.name.trim()) {
      setError('Product name is required.')
      return
    }
    if (formData.price <= 0) {
      setError('Price must be greater than 0.')
      return
    }

    if (formData.paymentMode === 'DEPOSIT' && (!Number.isInteger(formData.depositPercent) || (formData.depositPercent ?? 0) < 1 || (formData.depositPercent ?? 0) > 99)) {
      setError('Choose a deposit percentage between 1 and 99.')
      return
    }

    setIsSaving(true)

    // Assemble images
    const allImages = Array.from(new Set([
      ...(primaryImage ? [primaryImage] : []),
      ...(hoverImage ? [hoverImage] : []),
      ...additionalImages,
    ]))

    const payload: CreateProductRequest = {
      ...formData,
      images: allImages,
    }

    try {
      if (isEditing && numericId) {
        await sellerApi.updateProduct(numericId, payload)
        // Also update media config if primary/hover changed
        await sellerApi.updateMediaConfig(numericId, {
          thumbnailUrl: primaryImage || undefined,
          hoverImageUrl: hoverImage || undefined,
          images: allImages,
          ...framing,
        })
        setSuccessMsg('Piece updated successfully.')
      } else {
        const created = await sellerApi.createProduct(payload)
        {
          await sellerApi.updateMediaConfig(created.id, {
            thumbnailUrl: primaryImage || undefined,
            hoverImageUrl: hoverImage || undefined,
            images: allImages,
            ...framing,
          })
        }
        setSuccessMsg('Piece created successfully.')
      }

      setTimeout(() => {
        navigate('/seller/products')
      }, 1000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save product.')
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-16 text-center text-[var(--portal-accent-text)]">
        <div className="w-8 h-8 border-2 border-[var(--portal-accent-border)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs uppercase tracking-widest text-[var(--portal-muted)]">Loading piece details...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--portal-border)]">
        <div className="flex items-center gap-3">
          <Link
            to="/seller/products"
            className="p-2 text-[var(--portal-muted)] hover:text-[var(--portal-text)] hover:bg-[var(--portal-hover)] rounded-lg transition-colors"
            title="Back to Catalog"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--portal-accent-text)]">
              {isEditing ? 'Curate Existing Piece' : 'New Creation'}
            </span>
            <h1 className="text-2xl font-serif text-[var(--portal-text)]">
              {isEditing ? `Edit: ${formData.name}` : 'Add New Product'}
            </h1>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[var(--portal-danger-soft)] border border-[var(--portal-danger-border)] rounded-xl flex items-center gap-3 text-xs text-[var(--portal-danger)]">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-[var(--portal-success-soft)] border border-[var(--portal-success-border)] rounded-xl flex items-center gap-3 text-xs text-[var(--portal-success)]">
          <CheckCircle size={16} className="flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Attributes Card */}
        <div className="bg-[var(--portal-surface)] p-6 rounded-2xl border border-[var(--portal-border)] space-y-4">
          <h2 className="text-sm font-serif text-[var(--portal-text)] flex items-center gap-2">
            <Layers size={16} className="text-[var(--portal-accent-text)]" />
            <span>Essential Specifications</span>
          </h2>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--portal-muted)] mb-1.5 font-medium">
              Piece Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. The Luminary Choker in 18k Vermeil"
              className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-sm text-[var(--portal-text)] placeholder-[var(--portal-placeholder)] focus:border-[var(--portal-accent)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--portal-muted)] mb-1.5 font-medium">
                Category
              </label>
              <select
                value={formData.categoryId || ''}
                onChange={(e) => {
                  const catId = e.target.value ? parseInt(e.target.value, 10) : undefined
                  const selectedCat = categories.find((c) => c.id === catId)
                  setFormData({
                    ...formData,
                    categoryId: catId,
                    categoryName: selectedCat ? selectedCat.name : '',
                  })
                }}
                className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-sm text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--portal-muted)] mb-1.5 font-medium">
                Inventory Units *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-sm text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--portal-muted)] mb-1.5 font-medium">
                Selling Price (MAD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="450.00"
                className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-sm text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--portal-muted)] mb-1.5 font-medium">
                Original Reference Price (MAD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.originalPrice ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    originalPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                  })
                }
                placeholder="600.00"
                className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-sm text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--portal-muted)] mb-1.5 font-medium">
                Discount Rate (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discountRate ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discountRate: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  })
                }
                placeholder="25"
                className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-sm text-[var(--portal-text)] focus:border-[var(--portal-accent)] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--portal-muted)] mb-1.5 font-medium">
              Description & Poetry
            </label>
            <textarea
              rows={4}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the craftsmanship, materials, dimensions, and styling inspiration..."
              className="w-full px-4 py-2.5 bg-[var(--portal-surface-alt)] border border-[var(--portal-border)] rounded-xl text-sm text-[var(--portal-text)] placeholder-[var(--portal-placeholder)] focus:border-[var(--portal-accent)] focus:outline-none"
            />
          </div>

          {/* Per-product payment policy */}
          <fieldset className="border border-[var(--portal-border)] rounded-xl p-4 space-y-3">
            <legend className="text-xs font-semibold text-[var(--portal-text)] px-2">Customer payment terms</legend>
            <p className="text-xs text-[var(--portal-muted)]">Choose how this product is paid for. No online payments are collected by Store Studio yet; coordinate advance payments outside the platform and verify them in Orders.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {([
                ['COD', 'Cash on delivery', 'Customer pays the full amount at delivery'],
                ['DEPOSIT', 'Deposit + COD', 'Advance payment, remainder at delivery'],
                ['PREPAID', 'Full prepayment', 'Full amount paid before dispatch'],
              ] as const).map(([mode, title, description]) => (
                <label key={mode} className={`p-3 border rounded-lg cursor-pointer text-xs ${formData.paymentMode === mode ? 'border-[var(--portal-accent)] bg-[var(--portal-accent-soft)]' : 'border-[var(--portal-border)] bg-[var(--portal-surface-alt)]'}`}>
                  <span className="flex gap-2 items-center font-semibold text-[var(--portal-text)]"><input type="radio" name="paymentMode" checked={(formData.paymentMode ?? 'COD') === mode} onChange={() => setFormData(previous => ({ ...previous, paymentMode: mode, depositPercent: mode === 'DEPOSIT' ? (previous.depositPercent ?? 30) : undefined }))} />{title}</span>
                  <span className="block mt-1 text-[var(--portal-muted)]">{description}</span>
                </label>
              ))}
            </div>
            {formData.paymentMode === 'DEPOSIT' && (
              <label className="block text-xs font-medium text-[var(--portal-text)]">Deposit percentage (1–99%)
                <input type="number" min="1" max="99" step="1" required value={formData.depositPercent ?? 30}
                  onChange={e => setFormData(previous => ({ ...previous, depositPercent: Number(e.target.value) }))}
                  className="mt-1 block w-28 px-3 py-2.5 rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface-alt)] text-[var(--portal-text)]" />
                <span className="block mt-1 text-[var(--portal-muted)]">The remainder is collected on delivery. Shipping is due on delivery unless every item is prepaid.</span>
              </label>
            )}
          </fieldset>

          {/* Checkboxes */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--portal-text)]">
              <input
                type="checkbox"
                checked={formData.isPack}
                onChange={(e) => setFormData({ ...formData, isPack: e.target.checked })}
                className="rounded border-[var(--portal-border)] text-[var(--portal-accent-text)] focus:ring-0"
              />
              <span>Is Gift Set or Curated Pack</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--portal-text)]">
              <input
                type="checkbox"
                checked={formData.isListed}
                onChange={(e) => setFormData({ ...formData, isListed: e.target.checked })}
                className="rounded border-[var(--portal-border)] text-[var(--portal-accent-text)] focus:ring-0"
              />
              <span>Publicly Listed on Customer Storefront</span>
            </label>
          </div>
        </div>

        {/* Visual Media & Imagery Card */}
        <div className="bg-[var(--portal-surface)] p-6 rounded-2xl border border-[var(--portal-border)] space-y-4">
          <h2 className="text-sm font-serif text-[var(--portal-text)] flex items-center gap-2">
            <ImageIcon size={16} className="text-[var(--portal-accent-text)]" />
            <span>Visual Media & Cloud Storage</span>
          </h2>

          <p className="text-xs text-[var(--portal-muted)]">Photos are uploaded to Cloudflare R2. The first image is the main photo; use the controls below to select a hover photo and adjust the framing. Changes are non-destructive.</p>
          <label className="inline-flex items-center gap-2 px-4 py-3 bg-[var(--portal-accent)] text-[var(--portal-on-accent)] text-xs font-semibold rounded-xl cursor-pointer">
            <Upload size={16} className={isUploading ? 'animate-bounce' : ''} />
            {isUploading ? 'Uploading photos…' : 'Upload product photos'}
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
          </label>
          <div className="flex flex-wrap gap-3">
            {additionalImages.map((img, idx) => <div key={img} className="w-32 bg-[var(--portal-surface-alt)] p-2 border border-[var(--portal-border)] rounded-xl space-y-2">
              <div className="aspect-square overflow-hidden rounded-lg bg-white"><img src={img} alt={`Uploaded photo ${idx + 1}`} className="w-full h-full object-contain" /></div>
              <label className="flex items-center gap-1 text-[11px] text-[var(--portal-text)]"><input type="radio" name="main-image" checked={primaryImage === img} onChange={() => setPrimaryImage(img)} /> Main</label>
              <label className="flex items-center gap-1 text-[11px] text-[var(--portal-text)]"><input type="radio" name="hover-image" checked={hoverImage === img} onChange={() => setHoverImage(img)} /> Hover</label>
              <button type="button" onClick={() => handleRemoveImage(idx)} className="text-xs text-red-500 flex gap-1 items-center"><Trash2 size={12} /> Remove</button>
            </div>)}
            {additionalImages.length === 0 && <p className="text-xs text-[var(--portal-muted)]">No photos uploaded yet. Existing external images can still be displayed and edited.</p>}
          </div>
          <div className="border-t border-[var(--portal-border)] pt-4 space-y-3">
            <p className="text-xs text-[var(--portal-text)] font-semibold">Optional product video</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--portal-border)] text-[var(--portal-text)] rounded-lg text-xs cursor-pointer">
              <Upload size={14} /> {isUploadingVideo ? 'Uploading video…' : formData.videoUrl ? 'Replace video' : 'Upload MP4 / WebM video'}
              <input type="file" accept="video/mp4,video/webm" className="hidden" disabled={isUploadingVideo} onChange={handleVideoUpload} />
            </label>
            {formData.videoUrl && <div className="flex gap-3 items-center"><video className="max-h-36 rounded-md" controls src={formData.videoUrl} />
              <button type="button" className="text-red-500 text-xs" onClick={() => setFormData(previous => ({ ...previous, videoUrl: '' }))}>Remove video</button></div>}
          </div>
          {primaryImage && <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-[var(--portal-border)] pt-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--portal-text)] mb-3">Live storefront crop preview</p>
              <div className="max-w-xs touch-none bg-[var(--portal-surface-alt)] rounded-xl border border-[var(--portal-border)] overflow-hidden cursor-move" style={imageFrameStyle(framing)}
                onPointerDown={event => { event.currentTarget.setPointerCapture(event.pointerId); event.currentTarget.dataset.lastX = String(event.clientX); event.currentTarget.dataset.lastY = String(event.clientY) }}
                onPointerMove={event => { if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
                  const lastX = Number(event.currentTarget.dataset.lastX), lastY = Number(event.currentTarget.dataset.lastY)
                  const { width, height } = event.currentTarget.getBoundingClientRect()
                  setImagePositionX(v => Math.min(100, Math.max(0, Math.round(v - (event.clientX - lastX) / width * 100))))
                  setImagePositionY(v => Math.min(100, Math.max(0, Math.round(v - (event.clientY - lastY) / height * 100))))
                  event.currentTarget.dataset.lastX = String(event.clientX); event.currentTarget.dataset.lastY = String(event.clientY)
                }}>
                <img draggable={false} src={primaryImage} alt="Your live product photo crop" className="w-full h-full pointer-events-none select-none" style={imagePhotoStyle(framing)} />
              </div>
              <p className="text-[11px] text-[var(--portal-muted)] mt-2">Drag the photo to adjust its position. Your original upload is preserved.</p>
            </div>
            <div className="space-y-3">
              <label className="block text-xs text-[var(--portal-text)]">Photo shape
                <select value={imageAspect} onChange={e => setImageAspect(e.target.value as typeof imageAspect)} className="w-full mt-1 p-2 rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface-alt)] text-[var(--portal-text)]"><option value="square">Square (1:1)</option><option value="portrait">Portrait (3:4)</option><option value="landscape">Landscape (4:3)</option></select>
              </label>
              <label className="block text-xs text-[var(--portal-text)]">Image fit
                <select value={imageFit} onChange={e => setImageFit(e.target.value as typeof imageFit)} className="w-full mt-1 p-2 rounded-lg border border-[var(--portal-border)] bg-[var(--portal-surface-alt)] text-[var(--portal-text)]"><option value="cover">Fill frame / crop edges</option><option value="contain">Show whole photo (good for white backgrounds)</option></select>
              </label>
              {([['Horizontal position', imagePositionX, setImagePositionX], ['Vertical position', imagePositionY, setImagePositionY], ['Zoom', imageZoom, setImageZoom]] as const).map(([label, value, update]) => <label className="block text-xs text-[var(--portal-text)]" key={label}>{label}: {value}{label === 'Zoom' ? '%' : ''}
                <input type="range" className="block w-full mt-1 accent-amber-500" min={label === 'Zoom' ? 100 : 0} max={label === 'Zoom' ? 200 : 100} value={value} onChange={e => update(Number(e.target.value))} />
              </label>)}
              <button type="button" className="px-3 py-2 text-xs border border-[var(--portal-border)] text-[var(--portal-text)] rounded-lg" onClick={resetFraming}>Reset framing</button>
            </div>
          </div>}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/seller/products"
            className="px-6 py-2.5 bg-[var(--portal-surface-alt)] hover:bg-[var(--portal-hover)] text-[var(--portal-muted)] hover:text-[var(--portal-text)] rounded-xl text-xs uppercase tracking-wider font-semibold border border-[var(--portal-border)] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving || isUploading || isUploadingVideo}
            className="px-8 py-2.5 bg-[var(--portal-accent)] hover:bg-[var(--portal-accent)] text-[var(--portal-on-accent)] font-semibold text-xs uppercase tracking-wider rounded-xl transition-colors shadow-md shadow-none flex items-center gap-2 disabled:opacity-60"
          >
            <Save size={15} />
            <span>{isSaving ? 'Preserving Changes...' : isEditing ? 'Save Changes' : 'Publish Piece'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default SellerProductFormPage
