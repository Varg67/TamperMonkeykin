## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-11 - Async Button State & Try/Finally Pattern
**Learning:** Leaving buttons enabled during asynchronous API calls leads to duplicate submissions, while hardcoding the restoration text breaks maintainability. A disabled state missing a `:not(:disabled)` on the hover selector creates confusing UX.
**Action:** Always dynamically cache a button's original `textContent` before mutating it, disable the button, and guarantee restoration using a `try/finally` block. Use `:not(:disabled)` in CSS for hover states.
