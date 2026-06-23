## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-04-18 - Async Action Button Loading States
**Learning:** Lacking visual feedback (like disabled state or loading text) during asynchronous operations on custom action buttons allows for duplicate submissions and frustrates users.
**Action:** Always provide loading text and use `:disabled` pseudo-class for custom buttons during async operations. Wrap API calls in `try/finally` blocks to guarantee UI restoration by caching the button element and its initial text content dynamically.
