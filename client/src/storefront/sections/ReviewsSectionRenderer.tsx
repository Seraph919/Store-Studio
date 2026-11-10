import { useStoreReviewsQuery } from '../../hooks/useStoreQueries'
import type { StoreSection, StorefrontTemplateId } from '../../types/design'
interface Props { section: StoreSection; template: StorefrontTemplateId; storeName: string; isPreview?: boolean }
export function ReviewsSectionRenderer({ section, isPreview }: Props) {
  const query = useStoreReviewsQuery()
  const reviews = (query.data ?? []).filter(review => review.isVisible !== false)
  if (query.isPending || query.isError || reviews.length === 0) {
    if (!isPreview) return null
    return <section className="store-empty" role="status"><h2>{section.settings.title ?? 'Customer reviews'}</h2>
      <p>{query.isPending ? 'Loading customer reviews…' : query.isError ? 'Reviews could not be loaded. Try again later.' : 'No public reviews yet. Approved customer reviews will appear here.'}</p>
    </section>
  }
  return <section className="store-reviews store-section" aria-label="Customer reviews">
    <div className="store-section-heading"><span className="store-eyebrow">{section.settings.eyebrow}</span>
      <h2>{section.settings.title ?? 'Customer reviews'}</h2><p>{section.settings.subtitle}</p></div>
    <div className="store-review-grid">{reviews.slice(0, 6).map(review => <figure key={review.id} className="template-card store-review">
      <span aria-label={`${review.rating} out of 5 stars`} className="store-review-rating">{'★'.repeat(Math.max(0,Math.min(5,review.rating)))}</span>
      <blockquote>{review.comment}</blockquote><figcaption>{review.customerName}</figcaption>
    </figure>)}</div>
  </section>
}
