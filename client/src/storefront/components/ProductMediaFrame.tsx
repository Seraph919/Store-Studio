import type { CSSProperties, ImgHTMLAttributes } from 'react'
import type { Product } from '../../types'
import { StoreImage } from './StoreImage'

export type ImageFraming = Pick<Product, 'imageAspect' | 'imageFit' | 'imagePositionX' | 'imagePositionY' | 'imageZoom'>
export const DEFAULT_FRAMING: ImageFraming = { imageAspect: 'square', imageFit: 'cover', imagePositionX: 50, imagePositionY: 50, imageZoom: 100 }

export function imageFrameStyle(framing: ImageFraming): CSSProperties {
  return { aspectRatio: framing.imageAspect === 'portrait' ? '3 / 4' : framing.imageAspect === 'landscape' ? '4 / 3' : '1 / 1' }
}
export function imagePhotoStyle(framing: ImageFraming): CSSProperties {
  const x = framing.imagePositionX ?? 50
  const y = framing.imagePositionY ?? 50
  return { width: '100%', height: '100%', objectFit: framing.imageFit ?? 'cover', objectPosition: `${x}% ${y}%`,
    transform: `scale(${(framing.imageZoom ?? 100) / 100})`, transformOrigin: `${x}% ${y}%` }
}
interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> { src?: string; framing?: ImageFraming }
export function ProductMediaFrame({ src, framing = DEFAULT_FRAMING, alt = '', className = '', ...props }: Props) {
  return <div className={`store-product-photo ${className}`} style={imageFrameStyle(framing)}>
    <StoreImage src={src} alt={alt} {...props} style={imagePhotoStyle(framing)} />
  </div>
}
