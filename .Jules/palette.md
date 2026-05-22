## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-22 - Dynamic Async Button States Pattern
**Learning:** Hardcoding original text when restoring a button after an async operation breaks if the text is localized or dynamically generated. Also, simple `:hover` styles on custom buttons visually override the browser's native disabled state, causing active visual feedback on inactive elements.
**Action:** For all async button operations, cache `currentTarget.textContent` before mutation and restore it in a `try/finally` block to guarantee UI restoration regardless of previous dynamic text. Always use `:not(:disabled)` pseudo-classes when styling hover states on custom buttons to maintain correct visual feedback.
