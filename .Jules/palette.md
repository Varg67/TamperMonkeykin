## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-07-05 - Async Operations Feedback & Disabled States
**Learning:** Leaving submit buttons active during asynchronous API requests allows impatient users to trigger duplicate submissions and provides poor interaction feedback, degrading the UX.
**Action:** Always handle `:disabled` states on buttons during async calls, providing visual feedback by dynamically caching and updating the element's `textContent` (e.g., to 'SENDING...'). Use a `try/finally` block to guarantee UI restoration and ensure CSS `:hover` states use `:not(:disabled)`.
