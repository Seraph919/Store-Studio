# Maison Élite Frontend Documentation
> **Luxury & Premium Boutique E-Commerce Storefront**  
> Tech Stack: **React 19 + TypeScript + Vite 8**  
> Backend: **Spring Boot 3 + PostgreSQL + Redis**

---

## Table of Contents
1. [Architectural Overview](#1-architectural-overview)
2. [Design System & Color Palette (Option 3)](#2-design-system--color-palette-option-3)
3. [Typography Hierarchy](#3-typography-hierarchy)
4. [Backend Endpoints & API Service Mapping](#4-backend-endpoints--api-service-mapping)
5. [State Management & Contexts](#5-state-management--contexts)
6. [Component Architecture](#6-component-architecture)
7. [Directory Structure](#7-directory-structure)
8. [Setup, Build & Deployment](#8-setup-build--deployment)
9. [Cross-Origin Resource Sharing (CORS) & Network Bridge](#9-cross-origin-resource-sharing-cors--network-bridge)

---

## 1. Architectural Overview

The frontend is an editorial, high-ticket luxury e-commerce application designed to interface with the Spring Boot REST API backend. It adheres to strict accessibility standards (WCAG AA/AAA), modern React 19 patterns, clean separation of concerns, and full TypeScript type safety.

- **Framework**: React 19 (`react`, `react-dom`)
- **Build Tool**: Vite 8 with HMR and multi-target proxy
- **Language**: Strict TypeScript (`verbatimModuleSyntax`, `erasableSyntaxOnly`)
- **Iconography**: Lucide React (vector SVG, zero emoji icons)
- **Styling**: Vanilla CSS Custom Properties (zero runtime overhead, instant light/dark mode transitions)

---

## 2. Design System & Color Palette (Option 3)

The design system implements **Option 3: Premium & Luxury Boutique**, rooted in the **60-30-10 rule**:
- **60% Canvas**: Silk Alabaster (`#FAFAF9`) / Obsidian Black in dark mode
- **30% Structural Elements**: Deep Onyx (`#1C1917`), Greige Hairlines (`#E7E5E4`), Porcelain Surfaces (`#FFFFFF`)
- **10% High-Conversion CTA**: Burnished Gold (`#CA8A04` / `#EAB308`)

### Design Tokens Table

| Token Variable | Light Mode Hex | Dark Mode Hex | Role & Usage | Contrast Ratio |
| :--- | :--- | :--- | :--- | :--- |
| `--color-primary` | `#1C1917` (Deep Onyx) | `#F5F5F4` (Warm Alabaster) | High-contrast brand buttons, navbar badges | **17.5:1 (AAA)** |
| `--color-secondary` | `#44403C` (Warm Stone) | `#D6D3D1` (Soft Stone) | Subheadings, secondary links | **9.2:1 (AAA)** |
| `--color-cta` | `#CA8A04` (Burnished Gold) | `#EAB308` (Luminous Gold) | Primary actions: "Acquire Piece", "Checkout" | **8.4:1 on dark text** |
| `--color-cta-hover`| `#A16207` (Deep Gold) | `#CA8A04` (Burnished Gold) | 150ms smooth hover transition | — |
| `--color-cta-text` | `#0C0A09` (Obsidian) | `#0C0A09` (Obsidian) | Text on gold CTAs for maximum readability | **8.4:1 (AAA)** |
| `--bg-page` | `#FAFAF9` (Silk Alabaster) | `#0C0A09` (Obsidian Black) | Main viewport canvas background | — |
| `--bg-surface` | `#FFFFFF` (Porcelain) | `#1C1917` (Dark Onyx) | Product cards, dialogs, drawers | — |
| `--bg-subtle` | `#F5F5F4` (Greige) | `#292524` (Deep Stone) | Code backgrounds, docket stripes | — |
| `--border-subtle` | `#E7E5E4` (Hairline Greige) | `#292524` (Dark Hairline) | 1px luxury card borders and dividers | — |
| `--border-focus` | `#CA8A04` (Gold) | `#EAB308` (Gold) | Active input focus rings | — |
| `--text-heading` | `#0C0A09` (Obsidian) | `#FAFAF9` (Silk White) | Product titles, section headlines | **17.5:1 (AAA)** |
| `--text-body` | `#292524` (Warm Charcoal) | `#D6D3D1` (Soft Stone) | Primary body copy, specifications | **11.8:1 (AAA)** |
| `--text-muted` | `#78716C` (Warm Stone) | `#A8A29E` (Muted Greige) | Provenance notes, timestamps, SKUs | **4.6:1 (AA)** |
| `--color-badge` | `#D97706` (Amber Gold) | `#F59E0B` (Amber) | "Limited Edition", "Archival" | — |

---

## 3. Typography Hierarchy

Imported via Google Fonts in `src/index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');
```

- **Headings (`var(--heading)`)**: **Cormorant Garamond** (Serif)  
  Conveys heritage, prestige, and timeless editorial elegance for hero banners, brand names, and product names.
- **Interface & Body (`var(--sans)`)**: **Montserrat** (Geometric Sans)  
  High legibility across numerical pricing, inventory tables, navigation controls, and form inputs.

---

## 4. Backend Endpoints & API Service Mapping

All REST calls are wrapped inside modular service files in `src/services/` and use a central `apiFetch` wrapper with automatic JWT Bearer token injection.

| Domain | HTTP Method & Path | Frontend Service Function | UI Component | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST /api/v1/auth/login` | `authApi.login(credentials)` | `AuthModal.tsx` | Authenticates client, returns JWT token |
| **Auth** | `POST /api/v1/auth/register` | `authApi.register(data)` | `AuthModal.tsx` | Creates user profile, triggers auto-login |
| **Users** | `GET /api/v1/users/me` | `userApi.getMe()` | `UserProfileModal.tsx`, `AuthContext` | Loads logged-in user details & role |
| **Users** | `GET /api/v1/users` | `userApi.getUsers()` | `UserProfileModal.tsx` | Admin-only master client/user directory |
| **Products** | `GET /api/v1/products` | `productApi.getProducts(params)` | `ProductCatalog.tsx` | Supports category, search, page, size, sort |
| **Products** | `GET /api/v1/products/{id}` | `productApi.getProductById(id)` | `ProductDetailModal.tsx` | Fetches single product specifications |
| **Products** | `POST /api/v1/products` | `productApi.createProduct(dto)` | `CreateProductModal.tsx` | Adds artifact to catalog (Admins/Sellers) |
| **Cart** | `POST /api/carts` | `cartApi.createCart()` | `CartContext.tsx` | Generates UUID shopping cart session |
| **Cart** | `GET /api/carts/{cartId}` | `cartApi.getCart(cartId)` | `CartDrawer.tsx` | Retrieves items and calculated total |
| **Cart** | `POST /api/carts/{cartId}/items` | `cartApi.addItem(cartId, dto)` | `ProductCard.tsx`, `ProductDetailModal.tsx` | Adds piece to shopping bag |
| **Cart** | `PATCH /api/carts/{cartId}/items/{productId}` | `cartApi.updateQuantity(...)` | `CartDrawer.tsx` | Updates item quantity (+ / -) |
| **Cart** | `DELETE /api/carts/{cartId}/items/{productId}`| `cartApi.removeItem(...)` | `CartDrawer.tsx` | Removes piece from cart |
| **Orders** | `POST /api/v1/orders` | `orderApi.createOrder(dto)` | `CheckoutModal.tsx` | Converts cart to confirmed consignment |
| **Orders** | `GET /api/v1/orders/{id}` | `orderApi.getOrderById(id)` | `OrderSuccessModal.tsx` | Retrieves order docket and live status |
| **Seller** | `GET /api/seller/orders` | `sellerApi.getOrders()` | `SellerOrdersView.tsx` | Seller-only order queue |
| **Seller** | `PATCH /api/seller/orders/{orderId}/status` | `sellerApi.updateOrderStatus(...)`| `SellerOrdersView.tsx` | Progresses status: Processing, Shipped, etc. |

---

## 5. State Management & Contexts

### `AuthContext` (`src/context/AuthContext.tsx` & `src/context/useAuth.ts`)
- Persists JWT tokens in `localStorage` under `store_luxury_jwt_token`.
- Automatically calls `GET /api/v1/users/me` on boot to restore user identity and role (`CUSTOMER`, `SELLER`, `ADMIN`).
- Provides `login()`, `register()`, `logout()`, and `refreshUser()`.

### `CartContext` (`src/context/CartContext.tsx` & `src/context/useCart.ts`)
- Persists cart UUID in `localStorage` under `luxury_store_cart_id`.
- If no cart exists, automatically requests one via `POST /api/carts`.
- Tracks `itemCount`, `cart`, `isCartOpen`, and provides `addToCart()`, `updateQuantity()`, `removeItem()`, and `resetCart()`.

---

## 6. Component Architecture

- **`Navbar.tsx`**: Editorial header with the brand crest `✦`, storefront/seller view switch, cart badge counter, and auth controls.
- **`Hero.tsx`**: Editorial hero section featuring brand narrative, primary "Explore Collection" CTA, and 3 Pillars of Distinction (Bespoke Provenance, White-Glove Courier, Private Concierge).
- **`ProductCatalog.tsx`**: Paginated gallery supporting live text search, discipline/category pills, sorting by price and name, with graceful empty and loading states.
- **`ProductCard.tsx`**: Presentation card with image zoom, category pill, stock level alert, price, quick view action, and "Acquire" CTA.
- **`ProductDetailModal.tsx`**: Modal providing high-resolution view, detailed craftsmanship notes, stock quantity counter, and value guarantee badges.
- **`CreateProductModal.tsx`**: Dedicated registration modal for creating new inventory pieces (`POST /api/v1/products`).
- **`CartDrawer.tsx`**: Slide-over drawer displaying reserved items, subtotal calculation, free armored courier guarantee, and "Proceed to Checkout" action.
- **`CheckoutModal.tsx`**: Full courier delivery form capturing guest/client destination, phone, and address details.
- **`OrderSuccessModal.tsx`**: Official acquisition docket displaying order ID, courier destination, itemized invoice, and a live status poller.
- **`SellerOrdersView.tsx`**: Complete Seller Command Console for reviewing orders and advancing consignment status.
- **`UserProfileModal.tsx`**: Client account dossier displaying ID, role tag, and an administrative client registry table for Admin users.
- **`Footer.tsx`**: Atelier heritage story, trust credentials, discipline links, and private gazette subscription.

---

## 7. Directory Structure

```
client/
├── docs/
│   └── FRONTEND_DOCUMENTATION.md # This documentation
├── public/
├── src/
│   ├── components/
│   │   ├── AuthModal.tsx
│   │   ├── CartDrawer.tsx
│   │   ├── CheckoutModal.tsx
│   │   ├── CreateProductModal.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── Navbar.tsx
│   │   ├── OrderSuccessModal.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductCatalog.tsx
│   │   ├── ProductDetailModal.tsx
│   │   ├── SellerOrdersView.tsx
│   │   └── UserProfileModal.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   ├── useAuth.ts
│   │   └── useCart.ts
│   ├── services/
│   │   ├── apiClient.ts
│   │   ├── authApi.ts
│   │   ├── cartApi.ts
│   │   ├── orderApi.ts
│   │   ├── productApi.ts
│   │   ├── sellerApi.ts
│   │   └── userApi.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── Dockerfile
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.app.json
├── tsconfig.json
└── vite.config.ts
```

---

## 8. Setup, Build & Deployment

### Local Development
```bash
cd client
npm install
npm run dev
```
The application will launch on `http://localhost:5173`.  
Vite's dev proxy automatically forwards `/api` and `/auth` calls to `http://localhost:8080`.

### Production Build
```bash
npm run build
```
Outputs optimized, tree-shaken static assets into `client/dist/`.

### Lint Verification
```bash
npm run lint
```
Enforces ESLint with 0 errors and 0 warnings.

### Docker Compose
When run via the root `compose.yml`, the frontend container runs:
```bash
docker compose up front-end
```
and connects to the `spring-backend` container within the internal network.

---

## 9. Cross-Origin Resource Sharing (CORS) & Network Bridge

### Problem Addressed
When React runs on `http://localhost:5173` and Spring Boot runs on `http://localhost:8080`, browsers enforce cross-origin security rules. Without explicit backend CORS approval:
1. Browser preflight checks (`OPTIONS` requests) are stopped by Spring Security with `403 Forbidden`.
2. Direct asynchronous calls from the browser are blocked from reading cross-origin responses.

### Backend Configuration Architecture
The Spring Boot backend resolves this at two complementary layers:

1. **Spring Security Filter Chain (`SecurityConfiguration.java`)**:
   - `.cors(Customizer.withDefaults())`: Instructs Spring Security to delegate to the registered CORS configuration source.
   - `.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()`: Unconditionally permits preflight `OPTIONS` requests across all endpoints without requiring JWT authentication headers.
   - **`CorsConfigurationSource` Bean**:
     - **Allowed Origins**: `http://localhost:5173`
     - **Allowed Methods**: `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`
     - **Allowed Headers**: `*`
     - **Allow Credentials**: `true`

2. **Web MVC Configurer (`CorsConfig.java`)**:
   - Registers CORS mapping for `/api/**` at the MVC handler mapping layer.

### Frontend Consumption Dual-Mode Support
In `client/src/services/apiClient.ts`, requests support two modes:
- **Direct Cross-Origin Mode**: Set `VITE_API_BASE_URL=http://localhost:8080` in `.env`. Calls will directly target Spring Boot on `8080` with `credentials: 'include'`, fully handled by the Spring Boot CORS source.
- **Reverse Proxy / Same-Origin Mode**: If `VITE_API_BASE_URL` is empty, requests use relative paths (`/api/...`, `/auth/...`), which are routed via Vite dev proxy (local) or Nginx (production), bypassing browser cross-origin constraints entirely.

