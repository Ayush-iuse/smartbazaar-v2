# Research & Decisions: SmartBazaar V2.1 Premium UX, Motion System & Production Polish

This document details the technical research and architecture decisions chosen for the design and animation system.

---

## 1. Design Token Specifications (HSL Dark-First)

### Decision
Utilize a customized dark-first Tailwind/CSS HSL design palette.

### Rationale
Using HSL variables allows us to dynamically compute contrast ratios, control alpha transparency (crucial for glassmorphism backdrops), and perform theme transitions smoothly without color flashes.

### Alternatives Considered
- **Tailwind Raw Colors (e.g. `bg-zinc-900`)**: Rejected because it makes it difficult to adjust transparency borders dynamically and prevents smooth client-side theme color interpolation.

---

## 2. Animation Engine & WebGL Fallback Strategy

### Decision
Prioritize Framer Motion for UI/UX animations and route transitions. If WebGL is present and active, render a lightweight interactive canvas for the AI Assistant Orb; otherwise, fallback gracefully to a high-fidelity SVG/CSS pulsating gradient orb.

### Rationale
Framer Motion provides declarative animation lifecycles that integrate seamlessly with Next.js App Router. Utilizing CSS/SVG for the AI Copilot orb by default ensures zero startup lag, low bundle overhead, and 100% compatibility on mobile devices.

### Alternatives Considered
- **React Three Fiber (R3F) for all 3D features**: Rejected as a mandatory requirement because Three.js adds 500KB+ to the initial JS bundle, which violates our Lighthouse performance target (>90) on mobile networks. R3F should only load lazily as an optional enhancement.

---

## 3. Accessibility & Motion Suppression

### Decision
Integrate motion suppression hooks utilizing Tailwind's `motion-safe:` / `motion-reduce:` modifiers and custom Framer Motion `motionConfig`.

### Rationale
Ensures 100% compliance with WCAG AA Principle 2.3 (Seizures and Physical Reactions) by completely muting sliding, magnetic, and parallax elements if a user has enabled reduced motion settings in their operating system.

---

## 4. Performance Optimization

### Decision
Apply Next.js dynamic imports (`next/dynamic`) with `ssr: false` for all animated visual widgets, charts, and portals.

### Rationale
Reduces the main thread JS bundle weight, allowing the homepage hero to reach First Contentful Paint (FCP) in under 1.5 seconds.
