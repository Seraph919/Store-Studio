import React from 'react'
import { ArrowRight } from 'lucide-react'
import type { StoreSection, StorefrontTemplateId } from '../../types/design'

interface PromotionalBannerSectionRendererProps {
  section: StoreSection
  template: StorefrontTemplateId
}

export const PromotionalBannerSectionRenderer: React.FC<PromotionalBannerSectionRendererProps> = ({
  section,
}) => {
  const { settings } = section
  const text = settings.text || 'Browse our products.'
  const ctaText = settings.ctaText || 'Shop now'
  const ctaLink = settings.ctaLink || '/shop'

  return (
    <div
      className="py-3 px-4 text-center text-sm font-medium flex flex-wrap items-center justify-center gap-x-3 gap-y-2 transition-colors"
      style={{
        backgroundColor: settings.bgColor || 'var(--store-accent)',
        color: settings.textColor || '#ffffff',
      }}
    >
      <span>{text}</span>
      {ctaText && (
        <a
          href={ctaLink}
          className="inline-flex items-center gap-1 underline underline-offset-2 opacity-95 hover:opacity-100 font-semibold"
        >
          <span>{ctaText}</span>
          <ArrowRight className="w-3 h-3" />
        </a>
      )}
    </div>
  )
}
