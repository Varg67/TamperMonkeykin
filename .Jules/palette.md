## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-07-03 - Async Loading States for Form Submissions
**Learning:** In userscripts, async actions like API calls can leave the UI feeling unresponsive or allow duplicate submissions if buttons are not explicitly disabled.
**Action:** Always handle `:disabled` states with visual feedback (e.g., "SENDING...") during async operations, override `:hover` styles using `:not(:disabled)`, cache initial `textContent`, and restore the state safely in a `try/finally` block.
