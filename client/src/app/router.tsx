import { createBrowserRouter, Navigate } from 'react-router-dom'
import StoreLayout from '../layouts/StoreLayout'
import SellerLayout from '../layouts/SellerLayout'
import AdminLayout from '../layouts/AdminLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import { InstallationGate } from '../components/InstallationGate'
import SetupPage from '../pages/SetupPage'

// Customer Storefront Pages
import HomePage from '../pages/HomePage'
import ShopPage from '../pages/ShopPage'
import ProductPage from '../pages/ProductPage'
import CheckoutPage from '../pages/CheckoutPage'
import OrderSuccessPage from '../pages/OrderSuccessPage'
import RingSizeGuidePage from '../pages/RingSizeGuidePage'
import LoginPage from '../pages/LoginPage'

// Advanced Visual Storefront Editor
import StoreDesignEditor from '../features/design/StoreDesignEditor'

// Owner / Seller Portal Pages
import SellerDashboardPage from '../pages/seller/SellerDashboardPage'
import SellerOrdersPage from '../pages/seller/SellerOrdersPage'
import SellerProductsPage from '../pages/seller/SellerProductsPage'
import SellerProductFormPage from '../pages/seller/SellerProductFormPage'
import SellerReviewsPage from '../pages/seller/SellerReviewsPage'
import SellerProfilePage from '../pages/seller/SellerProfilePage'
import SellerShippingPage from '../pages/seller/SellerShippingPage'
import SellerApiKeysPage from '../pages/seller/SellerApiKeysPage'

// Admin Portal Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminSellersPage from '../pages/admin/AdminSellersPage'
import AdminCategoriesPage from '../pages/admin/AdminCategoriesPage'
import AdminProductsPage from '../pages/admin/AdminProductsPage'
import AdminReviewsPage from '../pages/admin/AdminReviewsPage'
import AdminSettingsPage from '../pages/admin/AdminSettingsPage'
import AdminSystemPage from '../pages/admin/AdminSystemPage'

export const router = createBrowserRouter([{
  element: <InstallationGate />,
  children: [
  { path: '/setup', element: <SetupPage /> },
  // Customer Storefront
  {
    path: '/',
    element: <StoreLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'products/:productId', element: <ProductPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'order/success', element: <OrderSuccessPage /> },
      { path: 'ring-size-guide', element: <RingSizeGuidePage /> },
      { path: 'login', element: <LoginPage /> },
    ],
  },

  // Single Store Architecture: individual store slugs redirect to the store root
  {
    path: '/stores/:slug',
    element: <Navigate to="/" replace />,
  },

  // Full-screen Store Studio Visual Editor
  {
    path: '/dashboard/design',
    element: (
      <ProtectedRoute allowedRoles={['OWNER', 'SELLER', 'ADMIN']}>
        <StoreDesignEditor />
      </ProtectedRoute>
    ),
  },

  // Store Owner Portal (Protected: OWNER, SELLER, or ADMIN)
  {
    path: '/seller',
    element: (
      <ProtectedRoute allowedRoles={['OWNER', 'SELLER', 'ADMIN']}>
        <SellerLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <SellerDashboardPage /> },
      { path: 'orders', element: <SellerOrdersPage /> },
      { path: 'products', element: <SellerProductsPage /> },
      { path: 'products/new', element: <SellerProductFormPage /> },
      { path: 'products/:id/edit', element: <SellerProductFormPage /> },
      { path: 'reviews', element: <SellerReviewsPage /> },
      { path: 'storefront', element: <Navigate to="/dashboard/design" replace /> },
      { path: 'design', element: <Navigate to="/dashboard/design" replace /> },
      { path: 'profile', element: <SellerProfilePage /> },
      { path: 'shipping', element: <SellerShippingPage /> },
      { path: 'api-keys', element: <SellerApiKeysPage /> },
    ],
  },

  // Dashboard aliases for owner
  {
    path: '/dashboard',
    element: <Navigate to="/seller" replace />,
  },
  {
    path: '/dashboard/orders',
    element: <Navigate to="/seller/orders" replace />,
  },
  {
    path: '/dashboard/products',
    element: <Navigate to="/seller/products" replace />,
  },

  // Admin Portal (Protected: ADMIN only)
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'sellers', element: <AdminSellersPage /> },
      { path: 'categories', element: <AdminCategoriesPage /> },
      { path: 'products', element: <AdminProductsPage /> },
      { path: 'reviews', element: <AdminReviewsPage /> },
      { path: 'settings', element: <AdminSettingsPage /> },
      { path: 'system', element: <AdminSystemPage /> },
    ],
  },

  // Fallback
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
  ],
}])

export default router
