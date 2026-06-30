## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-06-30 - Asynchronous Button Feedback
**Learning:** Without explicit disabled states and loading indicators on buttons during async operations, users may click multiple times causing duplicate submissions or confusion. Also, overriding `:hover` styles is necessary to prevent disabled buttons from appearing interactive.
**Action:** Always handle `:disabled` states and provide visual feedback (e.g., loading text/spinners) during asynchronous operations. Ensure `:hover` styles use `:not(:disabled)` in CSS, and wrap API calls in `try/finally` blocks to guarantee UI restoration while dynamically caching and restoring the button's initial `textContent`.
