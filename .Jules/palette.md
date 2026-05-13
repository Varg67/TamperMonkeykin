## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-19 - Async Button States
**Learning:** Lacking disabled states during async operations allows duplicate submissions, and unrestricted `:hover` effects on inactive elements cause confusing active visual feedback.
**Action:** Always implement explicit `:disabled` styling, override or scope `:hover` with `:not(:disabled)`, and use `try/finally` blocks to safely revert dynamic button text ("LOADING...") back to its original state.
