## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-06-06 - Async Button Loading States
**Learning:** Buttons triggering asynchronous API calls without explicit disabled states allow duplicate submissions and leave users confused about the action status.
**Action:** Always handle `:disabled` states on custom buttons, ensure `:hover` styles are scoped using `:not(:disabled)`, and wrap API calls in `try/finally` blocks to guarantee dynamic text restoration and re-enabling of the element.
