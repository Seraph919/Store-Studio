import type { Product } from '../types'
import type { SectionSettings } from '../types/design'

/** Never substitute unrelated products for an empty explicit selection. */
export function selectProducts(products: Product[], settings: SectionSettings): Product[] {
  const listed = products.filter(product => product.isListed !== false)
  let selected: Product[]
  switch (settings.strategy ?? 'featured') {
    case 'featured': case 'custom': case 'curated':
      selected = (settings.productIds ?? []).flatMap(id => listed.find(product => product.id === id) ?? [])
      break
    case 'newest': selected = [...listed].sort((a, b) => b.id - a.id); break
    case 'category': selected = settings.categoryName ? listed.filter(product => product.categoryName === settings.categoryName) : []; break
    case 'packs': selected = listed.filter(product => product.isPack === true); break
    default: selected = []
  }
  return selected.slice(0, Math.max(1, Math.min(16, settings.maxProducts ?? 8)))
}
