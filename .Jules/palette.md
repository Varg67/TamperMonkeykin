## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.
## 2026-04-15 - Prevent Duplicate Submissions with Async State
**Learning:** Users can accidentally trigger multiple identical API requests if asynchronous action buttons remain enabled during the network call, leading to duplicate submissions and poor visual feedback.
**Action:** Always handle `:disabled` states and provide visual feedback (e.g., loading text/spinners) during asynchronous operations by setting `disabled = true` before the request and wrapping the restoration in a `try/finally` block to guarantee the UI resets.
