# Data Model & Configuration Schema: Premium UX & Design System

This document describes the state models and custom CSS schemas utilized by the UI components.

---

## 1. Visual Preference State (Zustand Store Schema)

### Entity: UXThemeConfig
Represents the local client pref configuration stored in memory and synchronized with LocalStorage.

| Attribute Name | Data Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `theme` | `light` \| `dark` \| `system` | `system` | Active color scheme preference. |
| `reducedMotion` | `boolean` | `false` | True if user prefers static elements. |
| `fluidFPS` | `boolean` | `true` | Performance mode tracking flag. |

---

## 2. CSS Custom Properties (Theme Colors)

All color tokens are defined as raw HSL numeric variables to allow dynamic alpha shading (e.g. `hsla(var(--primary), 0.15)`).

```css
:root {
  /* HSL representation of brand colors */
  --primary: 262.1 83.3% 57.8%;     /* Indigo HSL */
  --primary-foreground: 210 20% 98%;
  
  --background: 224 71.4% 4.1%;     /* Dark slate background */
  --foreground: 210 20% 98%;
  
  --card: 224 71.4% 4.1%;
  --card-foreground: 210 20% 98%;
  
  --border: 240 3.7% 15.9%;
  --glass-opacity: 0.65;
}
```

---

## 3. Motion System Curves

Standardized easing properties exported for Framer Motion transitions:

```typescript
export const MOTION_EASINGS = {
  slickDecel: [0.16, 1, 0.3, 1],    // Apple-style decel
  magneticSpring: {
    type: "spring",
    stiffness: 150,
    damping: 15,
    mass: 0.1
  },
  fadeFast: {
    duration: 0.2,
    ease: "easeInOut"
  }
};
```
