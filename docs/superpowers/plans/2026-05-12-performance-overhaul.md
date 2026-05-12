# Performance Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce initial bundle size, serve images at correct dimensions, and eliminate blank-screen navigation for GM Minas.

**Architecture:** Fix broken image optimization utility first (all image components depend on it), then fix per-component lazy loading and URL params, then split the JS bundle by lazy-loading Home and fixing Framer Motion chunk isolation.

**Tech Stack:** Vite + React 19 + TypeScript + Supabase Storage Transformation API + Tailwind CSS v4

---

## File Map

| File | Change |
|------|--------|
| `src/lib/utils.ts` | Rewrite `getOptimizedImageUrl` to use `/render/image/public/` |
| `src/components/sections/product-carousel.tsx` | Fix width arg 400→600 in `getOptimizedImageUrl` calls |
| `src/components/sections/suppliers-carousel.tsx` | Add `loading="lazy"` to logo images |
| `src/App.tsx` | Lazy-load Home + replace `fallback={null}` with skeleton |
| `index.html` | Add `<link rel="preload">` for hero video |
| `vite.config.ts` | No change — `vendor-motion` manual chunk is already correct; fixing Home lazy-load is sufficient |

Note: `hero-banner.tsx` already has `loading="eager"` on slide 0 and `loading="lazy"` on the rest — no change needed.

---

## Task 1: Fix `getOptimizedImageUrl`

**Files:**
- Modify: `src/lib/utils.ts`

The current function converts render URLs *back* to object URLs and drops all params, meaning every image loads at full resolution.

- [ ] **Step 1.1: Replace the function body**

```typescript
export function getOptimizedImageUrl(url: string, width: number, _height?: number): string {
  if (!url) return url;

  if (url.includes('supabase.co/storage') || url.includes('supabase.in/storage')) {
    const base = url.split('?')[0]
      .replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
    return `${base}?width=${width}&quality=80&resize=contain`;
  }

  return url;
}
```

- [ ] **Step 1.2: Verify TypeScript compiles**

Run: `npm run build 2>&1 | head -30`  
Expected: no TypeScript errors related to `utils.ts`

- [ ] **Step 1.3: Commit**

```bash
git add src/lib/utils.ts
git commit -m "fix: getOptimizedImageUrl now uses Supabase render API with correct width/quality params"
```

---

## Task 2: Fix product-carousel image width

**Files:**
- Modify: `src/components/sections/product-carousel.tsx`

The carousel calls `getOptimizedImageUrl(product.image1, 400)` but the spec calls for 600px for product images. The hardcoded `?width=8000` in the URL strings will be replaced by the fixed function.

- [ ] **Step 2.1: Change width arg from 400 to 600**

In `src/components/sections/product-carousel.tsx`, line 150:

```typescript
// before
src={getOptimizedImageUrl(product.image1, 400)}

// after
src={getOptimizedImageUrl(product.image1, 600)}
```

- [ ] **Step 2.2: Commit**

```bash
git add src/components/sections/product-carousel.tsx
git commit -m "fix: product carousel requests 600px images instead of 8000px"
```

---

## Task 3: Add lazy loading to suppliers carousel

**Files:**
- Modify: `src/components/sections/suppliers-carousel.tsx`

Supplier logos (10 × 2 = 20 `<img>` tags) currently load without `loading="lazy"`.

- [ ] **Step 3.1: Add `loading="lazy"` and explicit dimensions**

In `src/components/sections/suppliers-carousel.tsx`, find the `<img>` tag inside the supplier card and update it:

```typescript
// before
<img
  src={supplier.logo}
  alt={`Logo ${supplier.name}`}
  className="w-full h-full object-contain transition-all duration-300"
/>

// after
<img
  src={supplier.logo}
  alt={`Logo ${supplier.name}`}
  loading="lazy"
  width={140}
  height={80}
  className="w-full h-full object-contain transition-all duration-300"
/>
```

- [ ] **Step 3.2: Commit**

```bash
git add src/components/sections/suppliers-carousel.tsx
git commit -m "perf: add loading=lazy and explicit dimensions to supplier logos"
```

---

## Task 4: Lazy-load Home page + add Suspense skeleton

**Files:**
- Modify: `src/App.tsx`

Home is the only page imported eagerly, adding ~325 KB to the initial bundle. `Suspense fallback={null}` causes a blank screen during navigation.

- [ ] **Step 4.1: Convert Home import to lazy**

In `src/App.tsx`:

```typescript
// Remove this line:
import Home from '@/app/page';

// Add with the other lazy imports:
const HomePage = lazy(() => import('@/app/page'));
```

- [ ] **Step 4.2: Update the route to use HomePage**

```typescript
// before
<Route path="/" element={<Home />} />

// after
<Route path="/" element={<HomePage />} />
```

- [ ] **Step 4.3: Replace `fallback={null}` with a lightweight skeleton**

```tsx
// before
<Suspense fallback={null}>

// after
<Suspense fallback={
  <div className="min-h-screen bg-white">
    <div className="h-[80px] bg-white border-b border-gray-100" />
    <div className="animate-pulse">
      <div className="w-full aspect-[16/7] bg-gray-200" />
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  </div>
}>
```

- [ ] **Step 4.4: Verify TypeScript compiles**

Run: `npm run build 2>&1 | head -30`  
Expected: no errors

- [ ] **Step 4.5: Commit**

```bash
git add src/App.tsx
git commit -m "perf: lazy-load Home page and add Suspense skeleton to eliminate blank screen"
```

---

## Task 5: Add hero video preload

**Files:**
- Modify: `index.html`

The hero video at `/videos/hero-video.mp4` loads without a preload hint, delaying LCP.

- [ ] **Step 5.1: Add preload link before `</head>`**

In `index.html`, add this line before `</head>`:

```html
<link rel="preload" as="video" href="/videos/hero-video.mp4" type="video/mp4">
```

- [ ] **Step 5.2: Commit**

```bash
git add index.html
git commit -m "perf: preload hero video to improve LCP"
```

---

## Verification

- [ ] Run `npm run build` — confirm no TypeScript errors and check bundle sizes in output
- [ ] Run `npm run preview` and open the site
- [ ] Open DevTools Network tab, reload: confirm product images load at ~600px (not 8000px)
- [ ] Navigate between pages: confirm skeleton appears instead of blank screen
- [ ] Check bundle output for `vendor-motion` — it should load lazily (not referenced in `index-*.js`)
