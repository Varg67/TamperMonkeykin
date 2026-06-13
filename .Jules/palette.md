## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-06-13 - Async UI Disabled States
**Learning:** Buttons controlling asynchronous network operations (like API calls) must implement visual disabled states to prevent duplicate submissions and provide feedback. Dynamically caching `textContent` and using `try/finally` blocks guarantees UI restoration even if exceptions occur.
**Action:** Always handle `:disabled` states for async buttons, modify text to indicate loading, ensure CSS avoids active hover styles on inactive elements using `:not(:disabled)`, and guarantee text restoration using cached text and `finally` blocks.
