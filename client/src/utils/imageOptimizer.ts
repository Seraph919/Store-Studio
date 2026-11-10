/**
 * Optimizes image URLs for faster loading, smaller payload, and modern formats.
 * For Unsplash images, dynamically resizes to the requested display width
 * and applies quality compression (q=75) with auto=format (WebP/AVIF).
 */
export function optimizeImageUrl(url: string | null | undefined, targetWidth: number = 420): string {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()
  if (!trimmed) return ''

  if (trimmed.includes('images.unsplash.com')) {
    try {
      const parsed = new URL(trimmed)
      parsed.searchParams.set('auto', 'format')
      parsed.searchParams.set('fit', 'crop')
      parsed.searchParams.set('w', targetWidth.toString())
      parsed.searchParams.set('q', '75')
      return parsed.toString()
    } catch {
      // Fallback regex replacement if URL constructor fails on relative/malformed strings
      let optimized = trimmed
      if (optimized.includes('w=')) {
        optimized = optimized.replace(/w=\d+/, `w=${targetWidth}`)
      } else {
        optimized += (optimized.includes('?') ? '&' : '?') + `w=${targetWidth}`
      }
      if (optimized.includes('q=')) {
        optimized = optimized.replace(/q=\d+/, 'q=75')
      }
      return optimized
    }
  }

  return trimmed
}

