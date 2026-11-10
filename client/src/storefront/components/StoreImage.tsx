import { useState, type ImgHTMLAttributes } from 'react'
import { PLATFORM_LOGO_LIGHT, PLATFORM_LOGO_DARK } from '../../branding/platformBrand'

export const lightLogo = PLATFORM_LOGO_LIGHT
export const darkLogo = PLATFORM_LOGO_DARK

export function StoreImage({ src, alt = '', fallback = '/image-unavailable.svg', ...props }:
  ImgHTMLAttributes<HTMLImageElement> & { fallback?: string }) {
  const [failed, setFailed] = useState<string>()
  return <img {...props} src={!src || failed === src ? fallback : src} alt={alt}
    onError={() => setFailed(src)} />
}
