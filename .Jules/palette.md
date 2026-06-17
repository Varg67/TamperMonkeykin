## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-04-08 - Async Operations & Visual Feedback
**Learning:** Users lack visual feedback during asynchronous API requests like saving the journal or pinging endpoints, leading to potential duplicate submissions and poor UX.
**Action:** Always handle `:disabled` states and provide visual feedback (e.g., loading text/spinners) during async operations. Wrap API calls in `try/finally` blocks to guarantee UI restoration. Add `:not(:disabled)` to hover styles to prevent active visual feedback on inactive elements.
