## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-06-19 - Adding async loading states
**Learning:** Adding dynamic text changes and `:disabled` CSS alongside `try/finally` blocks provides critical visual feedback and prevents duplicate submissions during asynchronous API calls, which improves accessibility and user confidence.
**Action:** When adding async interaction logic, always bind the button to `e.currentTarget`, cache its initial text, and guarantee state restoration using `finally`.
