## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-04-12 - Async Button Disabled States & UX Scoping
**Learning:** When adding disabled states to async operations to prevent duplicate submissions, applying a simple `:disabled` rule is insufficient if the original `:hover` state is not properly scoped. This causes a confusing UX where buttons appear active on hover despite being disabled.
**Action:** Always wrap original `:hover` states with `:not(:disabled)` when applying `:disabled` opacity and cursor adjustments, and ensure the button state is correctly restored within a `try/finally` block to prevent UI freeze.
