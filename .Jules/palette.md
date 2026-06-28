## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-06-28 - Async Button State Feedback
**Learning:** In userscripts, lacking visual feedback and disabled states for asynchronous buttons leads to duplicate submissions and user confusion, especially when API calls are delayed.
**Action:** Always handle `:disabled` states and provide visual feedback (e.g., loading text) during async operations. Ensure `:hover` styles are overridden using `:not(:disabled)`, and wrap API calls in `try/finally` blocks to guarantee UI restoration.
