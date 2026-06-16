## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-06-16 - Async Button States & UX Feedback
**Learning:** In Tampermonkey scripts where standard component libraries aren't available, async operations can cause user confusion and duplicate submissions without explicit visual feedback. Hardcoding button states for recovery is brittle.
**Action:** Always dynamically cache a button's `textContent` before async mutation and wrap the network request in a `try/finally` block to restore the UI. Apply `:disabled` CSS combined with `:not(:disabled)` on `:hover` styles to prevent active visual feedback on inactive elements.
