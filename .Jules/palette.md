## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.
## 2026-04-11 - Async Button Disabled States
**Learning:** Implementing disabled states with clear visual feedback (like 'SENDING...' or '...') and using `:not(:disabled)` for hover effects prevents active visual feedback on inactive elements and prevents duplicate submissions.
**Action:** Use `try/finally` blocks when implementing async operations to ensure the button is reliably restored to its original state, even if the API request fails.
