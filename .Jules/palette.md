## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-05-15 - Async Action Buttons UX
**Learning:** Applying `:disabled` to custom buttons without scoping `:hover` states leads to misleading active visual feedback on inactive elements. Additionally, hardcoding restored text can overwrite dynamic button states.
**Action:** When handling async operations, always dynamically cache `textContent` before mutation and restore it in a `try/finally` block to prevent duplicate submissions. Update CSS to scope `.knd-btn-action:not(:disabled):hover` and add a `.knd-btn-action:disabled` state for correct visual feedback.
