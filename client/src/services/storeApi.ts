import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from './apiClient'
import type {
  StoreDesignDto,
  UpdateStoreDesignDto,
  ParsedStoreDesign,
  StoreDesignConfig,
} from '../types/design'

export const storeDesignKeys = {
  all: ['store', 'design'] as const,
  published: () => [...storeDesignKeys.all, 'published'] as const,
}

export const storeApi = {
  getStoreDesign: async (): Promise<StoreDesignDto> => {
    return apiFetch<StoreDesignDto>('/api/v1/store/design')
  },

  updateStoreDesign: async (payload: UpdateStoreDesignDto): Promise<StoreDesignDto> => {
    return apiFetch<StoreDesignDto>('/api/v1/store/design', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
}

export const DEFAULT_DESIGN_CONFIG: StoreDesignConfig = {
  sections: [
    {
      id: 'hero',
      type: 'Hero',
      variant: 'fullscreen',
      enabled: true,
      settings: {
        eyebrow: 'store studio',
        title: 'Browse our products',
        intro:
          'View product details, prices, and available options.',
        cta: 'Browse catalog',
        ctaLink: '/shop',
        imageUrl: '',

        alignment: 'center',
        overlayOpacity: 0,
      },
    },
    {
      id: 'categories',
      type: 'Categories',
      variant: 'cards',
      enabled: true,
      settings: {
        title: 'Browse by category',
        subtitle: 'Find products by category.',
      },
    },
    {
      id: 'featured-products',
      type: 'FeaturedProducts',
      variant: 'editorial-grid',
      enabled: true,
      settings: {
        title: 'Featured products',
        subtitle: 'Browse selected products.',
        strategy: 'featured',
        columns: 4,
        maxProducts: 8,
      },
    },
    {
      id: 'brand-story',
      type: 'BrandStory',
      variant: 'split-right',
      enabled: true,
      settings: {
        eyebrow: 'brand story',
        title: 'About the store',
        description:
          'Browse our catalog to find product descriptions, prices, and available options.',
        cta: 'Browse products',
        ctaLink: '/shop',
        imageUrl:
          'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80',
      },
    },
    {
      id: 'packs-showcase',
      type: 'ProductCollection',
      variant: 'curated-packs',
      enabled: true,
      settings: {
        title: 'Collections and packs',
        subtitle:
          'Shop related products and packs.',
        strategy: 'packs',
        columns: 4,
        maxProducts: 4,
      },
    },
    {
      id: 'reviews',
      type: 'Reviews',
      variant: 'grid',
      enabled: true,
      settings: {
        eyebrow: 'customer feedback',
        title: 'What customers are saying',
        subtitle:
          'Read customer reviews.',
      },
    },
  ],
}

export function parseStoreDesign(dto?: StoreDesignDto | null): ParsedStoreDesign {
  if (!dto) {
    return {
      id: 1,
      template: 'MINIMAL',
      colorMode: 'LIGHT',
      paletteId: 'CHAMPAGNE',
      accentColor: '#F4B400',
      fontPreset: 'ELEGANT',
      config: DEFAULT_DESIGN_CONFIG,
    }
  }

  let parsedConfig: StoreDesignConfig = DEFAULT_DESIGN_CONFIG
  try {
    if (dto.designConfig) {
      const parsed = JSON.parse(dto.designConfig)
      if (parsed && Array.isArray(parsed.sections)) {
        parsedConfig = parsed
      }
    }
  } catch (err) {
    console.warn('Failed to parse store design JSON config, using fallback:', err)
  }

  return {
    id: dto.id,
    branding: dto.branding,
    template: dto.template || 'MINIMAL',
    colorMode: dto.colorMode || 'LIGHT',
    paletteId: dto.paletteId || 'CHAMPAGNE',
    accentColor: dto.accentColor || '#F4B400',
    fontPreset: dto.fontPreset || 'ELEGANT',
    config: parsedConfig,
    updatedAt: dto.updatedAt,
  }
}

export function useStoreDesignQuery() {
  return useQuery({
    queryKey: storeDesignKeys.published(),
    queryFn: storeApi.getStoreDesign,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  })
}

export function useUpdateStoreDesignMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: storeApi.updateStoreDesign,
    onSuccess: (updated) => {
      queryClient.setQueryData(storeDesignKeys.published(), updated)
      queryClient.invalidateQueries({ queryKey: ['store', 'settings'] })
      queryClient.invalidateQueries({ queryKey: storeDesignKeys.all })
    },
  })
}
