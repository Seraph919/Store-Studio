import { StoreImage } from '../components/StoreImage'
import React from 'react'
import { ArrowRight } from 'lucide-react'
import type { StoreSection, StorefrontTemplateId } from '../../types/design'

interface BrandStorySectionRendererProps {
  section: StoreSection
  template: StorefrontTemplateId
  storeName: string
  isPreview?: boolean
}

export const BrandStorySectionRenderer: React.FC<BrandStorySectionRendererProps> = ({
  section,
  template,
  storeName,
}) => {
  const { settings, variant } = section
  const eyebrow = settings.eyebrow || storeName
  const title = settings.title || `About ${storeName}`
  const description =
    settings.description ||
    'Browse our products for descriptions, prices, and available options.'
  const cta = settings.cta || 'Browse products'
  const ctaLink = settings.ctaLink || '/shop'
  const imageUrl =
    settings.imageUrl ||
    'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80'

  const isReverse = variant === 'split-left'

  // ----------------------------------------------------
  // MINIMAL TEMPLATE: Clean, stark border layout
  // ----------------------------------------------------
  if (template === 'MINIMAL') {
    return (
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[var(--store-border)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-12 items-center">
          <div className={isReverse ? 'lg:order-2' : ''}>
            <span className="text-sm text-[var(--store-text-muted)] block mb-3 font-mono">
              {eyebrow}
            </span>
            <h2 className="text-2xl sm:text-4xl font-light tracking-tight text-[var(--store-text)] store-heading mb-6 leading-tight">
              {title}
            </h2>
            <p className="text-sm sm:text-base text-[var(--store-text-muted)] font-normal leading-relaxed max-w-prose mb-8">
              {description}
            </p>
            <a
              href={ctaLink}
              className="inline-flex items-center gap-2 text-sm font-semibold border-b pb-1 border-[var(--store-text)] text-[var(--store-text)] hover:text-[var(--store-accent)] hover:border-[var(--store-accent)] transition-colors"
            >
              <span>{cta}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className={isReverse ? 'lg:order-1' : ''}>
            <div className="aspect-[4/3] max-h-[420px] lg:max-h-none overflow-hidden border border-[var(--store-border)]">
              <StoreImage
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover filter grayscale contrast-110"
              />
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ----------------------------------------------------
  // MODERN TEMPLATE: Rounded surface container with high impact
  // ----------------------------------------------------
  if (template === 'MODERN') {
    return (
      <section className="py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-[var(--store-surface-subtle)] rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-14 border border-[var(--store-border)] grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center min-w-0">
          <div className={`lg:col-span-7 space-y-6 ${isReverse ? 'lg:order-2' : ''}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-[var(--store-surface)] border border-[var(--store-border)] text-[var(--store-accent)]">
              <span>{eyebrow}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[var(--store-text)] store-heading leading-tight">
              {title}
            </h2>

            <p className="text-base text-[var(--store-text-muted)] leading-relaxed max-w-prose">
              {description}
            </p>

            <div className="pt-2">
              <a
                href={ctaLink}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-[var(--store-accent-text)] shadow transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: 'var(--store-accent)' }}
              >
                <span>{cta}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className={`lg:col-span-5 ${isReverse ? 'lg:order-1' : ''}`}>
            <div className="aspect-[4/3] lg:aspect-square max-h-[340px] sm:max-h-[420px] lg:max-h-none rounded-xl sm:rounded-2xl overflow-hidden border border-[var(--store-border)]">
              <StoreImage
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>
    )
  }

  // ----------------------------------------------------
  // EDITORIAL TEMPLATE (Default): Luxury Atelier Story with Gold Accents
  // ----------------------------------------------------
  return (
    <section className="py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className={`lg:col-span-6 space-y-6 ${isReverse ? 'lg:order-2' : ''}`}>
          <span className="text-sm font-semibold text-[var(--store-accent)] block">
            {eyebrow}
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-[var(--store-text)] store-heading leading-[1.15]">
            {title}
          </h2>
          <div className="w-12 h-0.5" style={{ backgroundColor: 'var(--store-accent)' }} />
          <p className="text-base sm:text-lg text-[var(--store-text-muted)] font-light leading-relaxed max-w-prose">
            {description}
          </p>
          <div className="pt-4">
            <a
              href={ctaLink}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-[var(--store-accent-text)] shadow-md transition-all hover:scale-105"
              style={{ backgroundColor: 'var(--store-accent)' }}
            >
              <span>{cta}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className={`lg:col-span-6 ${isReverse ? 'lg:order-1' : ''}`}>
          <div className="relative">
            <div className="aspect-[4/3] lg:aspect-[4/5] max-h-[400px] lg:max-h-none rounded-xl overflow-hidden shadow-lg lg:shadow-2xl border border-[var(--store-border)]">
              <StoreImage
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover filter brightness-95"
              />
            </div>
            {/* Subtle decorative gold frame in Editorial */}
            <div
              className="absolute -inset-4 rounded-xl -z-10 border border-opacity-30 hidden sm:block pointer-events-none"
              style={{ borderColor: 'var(--store-accent)' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
