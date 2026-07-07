# Feature Specification: SmartBazaar V2.1 Premium UX, Motion System & Production Polish

**Feature Branch**: `009-premium-ux-motion-polish`

**Created**: July 6, 2026

**Status**: Draft

**Input**: User description: "SmartBazaar V2.1 Premium UX, Motion System & Production Polish"

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unified Design System & Dark-First Premium Visuals (Priority: P1)

Users browsing the platform should experience a cohesive, high-end visual environment. Every page, component, and text block must utilize a shared premium design language that supports seamless dark/light theme switching without layout shifts or raw default colors.

**Why this priority**: Establish the visual baseline. Visual cohesion, correct typography, and color contrast form the absolute prerequisite for any premium experience.

**Independent Test**:
The user switches the color theme (Light/Dark/System) on the Navbar and navigates through the homepage, search, listing details, chat, and admin panel. The app remains fully responsive, exhibits zero layout shifts, applies custom Outfit/Inter typography, and exhibits 100% theme persistence across page refreshes.

**Acceptance Scenarios**:
1. **Given** the user is on the landing page, **When** they click the theme toggle on the Navbar, **Then** the page transitions smoothly between light and dark themes using a curated, dark-first HSL palette.
2. **Given** the user reloads any page, **When** the page loads, **Then** the preferred theme is applied instantly with no white/dark flash or flickering.
3. **Given** any standard card or container, **When** viewed on mobile or desktop, **Then** it renders with glassmorphism borders, subtle elevations, and precise HSL color tokens.

---

### User Story 2 - Micro-interactions & Fluid Transitions (Priority: P2)

Every interactive element—including page transitions, hover states, forms, and buttons—should feel responsive and alive. When navigation or actions occur, the application guides the user's attention using smooth motion and animations rather than abrupt state jumps.

**Why this priority**: Provides the "premium feel" akin to Stripe, Linear, or Apple. It reduces cognitive load by explaining interface changes visually.

**Independent Test**:
The user hovers over product cards, clicks on navigation links, and enters inputs into search fields. All hovers trigger smooth scaling/glow highlights, navigation triggers route-based page entry transitions at 60 FPS, and inputs display active focus rings.

**Acceptance Scenarios**:
1. **Given** the user navigates between pages, **When** the route changes, **Then** a smooth route exit and entry animation runs without page stuttering.
2. **Given** the user hovers over primary buttons or navigation tabs, **When** the pointer moves, **Then** a magnetic pull effect or sliding indicator aligns smoothly under the target.
3. **Given** the user submits an offer or initiates chat, **When** the transaction updates, **Then** a custom micro-interaction animation (e.g. success checkmark scale, message slide-in) triggers.

---

### User Story 3 - Immersive Parallax & Landing Redesign (Priority: P3)

The homepage landing hero must instantly capture the user's attention. An immersive design containing layered scroll parallax, a dynamic gradient background, and active statistics cards makes the marketplace feel state-of-the-art.

**Why this priority**: Essential to make the product stand out. Creates an impactful first impression for new visitors.

**Independent Test**:
The user scrolls down the landing page and moves their mouse across the hero header. Background layers move at varying speeds, elements fade in upon entering the viewport, and the AI copilot orb moves in reaction to pointer movements.

**Acceptance Scenarios**:
1. **Given** the user is scrolling the homepage hero, **When** they scroll downward, **Then** layered parallax elements adjust depth positions smoothly.
2. **Given** the user moves the cursor within the landing viewport, **When** pointer movement occurs, **Then** the ambient background gradients and interactive elements shift slightly to match the perspective.

---

### Edge Cases

- **Reduced Motion Enabled**: If the user has configured their operating system or browser to prefer reduced motion, all complex transitions, parallax, magnetic forces, and floating cards MUST immediately disable and fall back to static or minimal opacity-based transitions.
- **Low-Power/Low-Spec Hardware**: On mobile viewports or devices with constrained GPUs, animations must scale down dynamically (e.g. disable resource-heavy blurs or noise overlays) to maintain 60 FPS interaction rates without crashing.

---

## Requirements *(mandatory)*

### Functional Requirements

#### Design System & Foundations
- **FR-001**: System MUST establish a unified HSL/CSS design token system covering typography (Outfit/Inter), spacing, radii (rounded-2xl/rounded-3xl), shadows, and background blurs.
- **FR-002**: System MUST render all containers and cards with dark-first glassmorphism styling (transparent backdrops, border highlights, reflective layers) to establish modern depth.

#### Advanced Animations & Transitions
- **FR-003**: System MUST execute seamless page transitions on route changes.
- **FR-004**: System MUST apply magnetic hover pull forces to primary navigation links and action buttons.
- **FR-005**: System MUST implement scroll-driven viewport reveals for all page sections.

#### Parallax & Immersive Hero
- **FR-006**: The Landing Hero MUST include a mouse-position parallax offset for card and decorative vector elements.
- **FR-007**: The Landing Hero MUST feature a animated gradient spotlight background with noise texture overlay.

#### Polish of Buyer & Seller Panels
- **FR-008**: System MUST display progressive skeleton loaders with animated shimmer effects for all loading states.
- **FR-009**: CRM pipelines and analytics dashboards MUST utilize smooth exit/entry states for category column drops, pipeline drags, and data updates.
- **FR-010**: All charts and analytics data cards MUST render with entry scale animations.

#### Chat & AI Copilot Interactions
- **FR-011**: Chat window messages MUST slide in smoothly from the bottom, and users' typing indicators must pulsate.
- **FR-012**: The AI Copilot panel MUST contain an animated glowing AI orb that responds visually to states (thinking, speaking, idle).
- **FR-013**: Copilot stream responses MUST render with character-by-character typewriter fade-in.

#### Performance & Accessibility
- **FR-014**: System MUST check and respect the CSS `prefers-reduced-motion` media query to suppress animations.
- **FR-015**: All interactive custom widgets (magnetic buttons, floating cards, accordion details) MUST support keyboard tab indexing and display explicit focus rings.

---

### Key Entities

- **UXThemeConfig**: Represents the active application display preferences.
  - Attributes: `mode` (light | dark | system), `reduced_motion` (boolean), `font_family` (string).
- **MotionTokens**: Configures animation parameters for transitions.
  - Attributes: `duration_ms` (integer), `ease_curve` (string), `damping_ratio` (float).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Page transitions and interactive hovers MUST maintain 60 frames per second (FPS) on standard target mobile and desktop hardware.
- **SC-002**: Google Lighthouse score for **Accessibility** MUST measure above 95.
- **SC-003**: Google Lighthouse score for **Performance** (First Contentful Paint, Cumulative Layout Shift) MUST measure above 90.
- **SC-004**: Cumulative Layout Shift (CLS) during color theme toggles MUST measure exactly 0.0.

---

## Assumptions

- **Browser Capabilities**: Target browsers support standard CSS Custom Properties, flexbox/grid layouts, Backdrop Filter blur filters, and Framer Motion web animations.
- **Animation Frameworks**: High-fidelity UI animations can be fully achieved using Framer Motion, Tailwind CSS transitions, and vanilla CSS keyframes, without introducing heavy WebGL overhead or dependencies.
- **Asset Availability**: Custom high-resolution vector SVGs and modern ambient backgrounds will be generated or integrated locally.
