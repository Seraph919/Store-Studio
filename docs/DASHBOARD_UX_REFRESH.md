# Seller & Admin Dashboard UI Refresh

The dashboard interfaces have been refreshed without changing the existing product, order, customer, shipping, authentication, or administrator workflows.

## Seller dashboard

- Branded header with Refresh and Add Product actions
- Four KPI cards using existing `/api/v1/seller/analytics/kpis` response
- Interactive 7/14-day order activity chart using **actual** order dates and subtotals from `/api/v1/seller/orders`; filters support order count and order value
- Order-status doughnut based on the real `ordersByStatus` values
- Recent orders table with status labels and original Manage route
- Quick links and low-stock product alerts

The chart displays a clear empty state if no orders exist. Order values represent order subtotals, not necessarily settled payments.

## Admin dashboard

- Four KPI cards based on `/api/admin/analytics` (order value, orders, listings and administrative/seller accounts)
- Order-status doughnut and order pipeline from `ordersByStatus`
- Actual infrastructure status, JVM memory, query latency and uptime from `/api/admin/health`
- Shortcuts to existing account, catalog and system routes

The overview deliberately **does not show** the legacy `totalVisits`, traffic conversion rate, or fulfillment conversion percentage, since the current backend contains synthetic fallbacks for those figures. The old backend is otherwise unchanged.

## UI system

- Brighter white/light-gray layout, yellow `#FFC300` accent, refined typography, spacing and shadows
- Styled navigation and mobile-friendly layout without adding fake interactive search fields
- Preserved light/dark dashboard toggles
- No charting library or external dashboard dependencies

## Files

- `client/src/components/dashboard/DashboardWidgets.tsx` — reusable KPI cards, status chart, order trend and other widgets
- `client/src/styles/dashboard.css` — new overview-specific styles
- `client/src/styles/management.css` — shared management palette and navigation
- `client/src/pages/seller/SellerDashboardPage.tsx`
- `client/src/pages/admin/AdminDashboardPage.tsx`
- `client/src/layouts/SellerLayout.tsx`
- `client/src/layouts/AdminLayout.tsx`

## Verification checklist

1. Run `docker compose up -d --build` with your existing `.env` and database.
2. Log into `/seller` and `/admin`, verify every KPI and status total against the corresponding management page.
3. Switch order activity between 7 / 14 days and Order value / Orders.
4. Test Refresh, Add Product, View All, navigation links, light/dark toggle, and both dashboards at mobile and desktop sizes.
5. Confirm no-orders empty states and dark-mode contrast.

Only dashboard React and CSS files were changed. There is no migration and no server API change.
