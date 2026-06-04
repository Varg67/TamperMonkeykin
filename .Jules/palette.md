## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-06-04 - Async Button Loading States
**Learning:** To prevent duplicate submissions and improve UX for custom asynchronous operations, buttons require both visual feedback (e.g., text changes) and disabled states. `:hover` states must be scoped with `:not(:disabled)` so inactive elements don't show active feedback.
**Action:** Always handle `:disabled` states and provide visual feedback during async operations, wrapping API calls in `try/finally` blocks to guarantee UI restoration and scoping `:hover` rules appropriately.
