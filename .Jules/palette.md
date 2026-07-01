## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-07-01 - Async Button States & Duplicate Prevention
**Learning:** Buttons triggering async operations without disabled states allow duplicate submissions and lack clear visual feedback.
**Action:** Always apply `:disabled` attributes, dynamically cache `textContent` for loading states, ensure `:hover` uses `:not(:disabled)`, and wrap operations in `try/finally` blocks for reliable UI restoration.
