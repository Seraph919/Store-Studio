import React from 'react'

export const PLATFORM_NAME = 'Store Studio'
export const PLATFORM_TAGLINE = 'Commerce & Storefront Studio'
export const PLATFORM_VERSION = 'v2.4'
export const PLATFORM_LOGO_LIGHT = '/store-studio-logo-light.svg'
export const PLATFORM_LOGO_DARK = '/store-studio-logo-dark.svg'

export interface StoreBranding {
  storeName: string
  storeTagline: string
  logoUrl?: string
  logoDarkUrl?: string
}

export const DEFAULT_STORE_BRANDING: StoreBranding = {
  storeName: 'Store Studio',
  storeTagline: 'A clean storefront starter sellers can personalize',
  logoUrl: PLATFORM_LOGO_LIGHT,
  logoDarkUrl: PLATFORM_LOGO_DARK,
}

export const StoreStudioLogo: React.FC<{
  className?: string
  size?: number
  showWordmark?: boolean
  light?: boolean
}> = ({ className = '', size = 24, showWordmark = false, light = false }) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src={light ? PLATFORM_LOGO_DARK : PLATFORM_LOGO_LIGHT}
        width={size}
        height={size}
        alt=""
        aria-hidden="true"
        className="shrink-0 object-contain transition-transform hover:scale-105"
      />
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="font-semibold tracking-tight text-sm text-current">
            {PLATFORM_NAME}
          </span>
          <span className="text-[10px] tracking-wider uppercase opacity-60 font-mono">
            Commerce Platform
          </span>
        </div>
      )}
    </div>
  )
}
