## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-14 - Async Action Feedback & Disabled States
**Learning:** Custom UI buttons missing `:disabled` attributes and corresponding visual feedback (like opacity and loading text) during asynchronous operations lead to duplicate submissions and poor user experience, as the user is unsure if the action was registered. Furthermore, active `:hover` states on disabled buttons can cause confusion.
**Action:** Always implement `:disabled` states for asynchronous buttons, caching the original `textContent` and displaying a loading state. Wrap the async call in a `try/finally` block to guarantee UI restoration. Use `:not(:disabled)` in CSS to restrict hover states to active elements only.
