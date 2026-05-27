## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-27 - Asynchronous Button Loading States
**Learning:** Forms executing asynchronous actions (like saving journal entries or pinging APIs) without explicit disabled/loading states can lead to duplicate submissions and poor user feedback.
**Action:** Always handle `:disabled` states with visual feedback (e.g., text changes) during asynchronous operations. Wrap API calls in `try/finally` blocks to guarantee UI restoration, and scope button `:hover` styles with `:not(:disabled)` to prevent hover effects on inactive elements.
