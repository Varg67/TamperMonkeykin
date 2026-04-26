## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-04-26 - Async Visual Feedback Update
**Learning:** To prevent duplicate submissions and improve UX during asynchronous operations, it is crucial to handle `:disabled` states and provide visual feedback dynamically via DOM manipulation. Hardcoding assumed loading text strings can be brittle.
**Action:** When updating button text for async states, dynamically cache the element's initial `textContent` before mutation and use the cached variable to safely restore the original text in a `try/finally` block. Override `:hover` styles on disabled custom buttons using `:not(:disabled)` to prevent active visual feedback on inactive elements.
