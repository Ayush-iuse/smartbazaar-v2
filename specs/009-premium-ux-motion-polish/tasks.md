# Tasks: SmartBazaar V2.1 Premium UX, Motion System & Production Polish

**Input**: Design documents from `/specs/009-premium-ux-motion-polish/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Tests are optional and focused on user-facing verification steps in `quickstart.md`.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Explicit file paths are provided for each task.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project layout setup and styling presets initialization

- [ ] T001 Verify styling packages and configuration files in `frontend/package.json`
- [ ] T002 Configure tailwind theme extensions and utility presets in `frontend/tailwind.config.js`
- [ ] T003 [P] Set up testing utilities and mock environments in `frontend/jest.config.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core variables configuration and theme state store that must be complete before any user story can start

- [ ] T004 Define dark-first HSL variable scales in `frontend/src/app/globals.css`
- [ ] T005 [P] Create theme and reduced motion preference store in `frontend/src/lib/store.ts`
- [ ] T006 [P] Build global glassmorphism card component container in `frontend/src/components/ui/Card.tsx`
- [ ] T007 Implement global layout theme provider wrapper in `frontend/src/app/layout.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Unified Design System & Dark-First Premium Visuals (Priority: P1) 🎯 MVP

**Goal**: Seamless light/dark/system theme synchronization with zero layout shift and consistent visual styling

**Independent Test**: Switch color themes on the Navbar and refresh the page; confirm theme state persists instantly via LocalStorage.

### Implementation for User Story 1

- [ ] T008 [P] [US1] Build theme selection toggle dropdown component in `frontend/src/components/ThemeToggle.tsx`
- [ ] T009 [US1] Integrate theme toggle dropdown button inside header in `frontend/src/components/Navbar.tsx`
- [ ] T010 [P] [US1] Apply dark-first HSL contrast variables to buyer listing view in `frontend/src/app/page.tsx`
- [ ] T011 [US1] Convert category details card layout to premium glass container in `frontend/src/components/ListingCard.tsx`
- [ ] T012 [P] [US1] Apply theme color variables to the settings panel in `frontend/src/app/settings/page.tsx`
- [ ] T013 [US1] Apply theme color variables to the notifications list in `frontend/src/app/notifications/page.tsx`

**Checkpoint**: User Story 1 is functional. Theme toggle switches dark/light states without flashes.

---

## Phase 4: User Story 2 - Micro-interactions & Fluid Transitions (Priority: P2)

**Goal**: Implement Framer Motion transitions, magnetic pulls, and loader shimmers for interactive responsiveness

**Independent Test**: Navigate between pages and hover over navigation tabs; confirm page entry animations and sliding tab indicators execute at 60 FPS.

### Implementation for User Story 2

- [ ] T014 [P] [US2] Implement global route exit/entry motion transition wrapper in `frontend/src/app/template.tsx`
- [ ] T015 [US2] Code magnetic pull hover hooks for interactive tabs in `frontend/src/components/Navbar.tsx`
- [ ] T016 [P] [US2] Create progressive skeleton loading component with shimmer keyframes in `frontend/src/components/SkeletonLoader.tsx`
- [ ] T017 [US2] Implement micro-interactions for incoming chat bubbles in `frontend/src/app/messages/page.tsx`
- [ ] T018 [P] [US2] Polish drag-and-drop animation states inside CRM columns in `frontend/src/app/seller/page.tsx`
- [ ] T019 [US2] Apply entry scale hover animations to analytics details card lists in `frontend/src/app/analytics/page.tsx`

**Checkpoint**: User Story 2 is functional. Layout transitions and hover animations scale down if reduced motion is active.

---

## Phase 5: User Story 3 - Immersive Parallax & Landing Redesign (Priority: P3)

**Goal**: Build a highly polished, interactive landing page hero with spotlight effects and scrolling depth layers

**Independent Test**: Scroll down the homepage and verify sections reveal themselves smoothly and mouse parallax adjusts card offsets.

### Implementation for User Story 3

- [ ] T020 [P] [US3] Implement scroll-triggered reveal animations in `frontend/src/app/page.tsx`
- [ ] T021 [US3] Design animated spotlight gradient overlay behind headline in `frontend/src/app/page.tsx`
- [ ] T022 [P] [US3] Code mouse-coordinate parallax tracking calculations in `frontend/src/app/page.tsx`
- [ ] T023 [US3] Implement category carousel horizontal scroll velocity tracker in `frontend/src/app/page.tsx`
- [ ] T024 [P] [US3] Build reactive AI copilot visual orb component in `frontend/src/components/CopilotOrb.tsx`
- [ ] T025 [US3] Integrate reactive AI orb inside copilot panel in `frontend/src/app/copilot/page.tsx`

**Checkpoint**: User Story 3 is functional. Immersive hero effects adapt automatically depending on prefers-reduced-motion.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Build validation and compliance audits

- [ ] T026 Audit CSS prefers-reduced-motion overrides in `frontend/src/app/globals.css`
- [ ] T027 Verify keyboard tab accessibility and focus ring displays across all input fields
- [ ] T028 Run Next.js production build check locally via `npm run build`
- [ ] T029 Execute Lighthouse navigation audit and optimize layout shift timings
- [ ] T030 Validate testing scenarios defined in `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Core configuration. Starts immediately.
- **Foundational (Phase 2)**: Depends on Setup. Blocks all User Stories.
- **User Stories (Phases 3-5)**: Depend on Foundation. Can be developed sequentially (US1 → US2 → US3) or in parallel.
- **Polish (Phase 6)**: Depends on all user stories being complete.

---

## Parallel Execution Plan: User Story 1

```bash
# Developer A:
Task: "Build theme selection toggle dropdown component in frontend/src/components/ThemeToggle.tsx"

# Developer B:
Task: "Apply dark-first HSL contrast variables to buyer listing view in frontend/src/app/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Setup and Foundational (Phases 1-2).
2. Complete User Story 1: Dark-First theme dropdown (Phase 3).
3. Validate: Test LocalStorage persistence and confirm zero layout shift.
4. Deploy MVP.

### Incremental Delivery
1. Setup + Foundation -> Theme Base Ready.
2. US1 -> Live Dark/Light Sync (MVP).
3. US2 -> 60 FPS transitions and hover pulls.
4. US3 -> Redesigned landing page.
