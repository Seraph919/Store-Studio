import { useLayoutEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import CartDrawer from '../components/CartDrawer'
import { useStoreSettingsQuery } from '../hooks/useStoreQueries'
import { parseStoreDesign, useStoreDesignQuery } from '../services/storeApi'
import { StoreShell } from '../storefront/StoreShell'

export default function StoreLayout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // React Router preserves the document scroll position across client-side routes.
  // Start each storefront page (including product details) at the top, while
  // leaving /shop?category=... and other same-page filter updates untouched.
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  const { data: settings } = useStoreSettingsQuery()
  const { data: design } = useStoreDesignQuery()
  return (
    <StoreShell design={parseStoreDesign(design)} settings={settings}>
      <Outlet />
      <CartDrawer onProceedToCheckout={() => navigate('/checkout')} />
    </StoreShell>
  )
}
