## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-06-05 - Async Disabled States & Try/Finally
**Learning:** Users can accidentally double-submit data during high latency asynchronous actions without visual loading indicators or disabled states on buttons.
**Action:** Always handle `:disabled` states and provide visual feedback (e.g., loading text/spinners) during async operations. Overwrite `:hover` styles using `:not(:disabled)` to avoid visual feedback on inactive elements. Cache the button's initial text dynamically before mutation, and restore it safely inside a `try/finally` block to ensure UI restoration.
