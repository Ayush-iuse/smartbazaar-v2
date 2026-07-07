# Validation & Quickstart Guide: Premium UX & Motion System

This guide outlines how to execute validation scenarios to verify the visual polish and animation FPS targets.

---

## 1. Local Development Validation

Verify that the project compiles and starts up with the new design tokens:

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000` in Google Chrome.

---

## 2. Testing Scenarios

### Scenario A: Reduced Motion Verification
1. Open the browser's developer console (F12).
2. Open the Command Menu (`Ctrl+Shift+P` on Windows).
3. Type `Emulate CSS media feature prefers-reduced-motion` and hit Enter.
4. Verify that:
   * Route transitions are instant (no sliding or fading).
   * Hover magnetic effects on buttons are disabled.
   * AI Copilot orb stops glowing or animations become static.

### Scenario B: Cumulative Layout Shift (CLS) Theme Test
1. Select the **Lighthouse** tab in Chrome Developer Tools.
2. Select **Navigation (Default)** and click **Analyze page load**.
3. Under the performance breakdown, confirm that **CLS** reads exactly `0`.
4. Toggle the theme button on the Navbar multiple times and verify that the layout elements do not shift or blink.
