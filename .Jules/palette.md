## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-04-21 - Async Disabled State & Hover Override
**Learning:** Missing `:disabled` states on asynchronous action buttons cause poor UX, double-submission risks, and lack of visual feedback. However, simply adding a `:disabled` pseudo-class is insufficient if there are existing `:hover` effects, as users will still trigger visual changes when interacting with the inactive button.
**Action:** Always wrap API calls in a `try/finally` block to safely manage the `.disabled` attribute. Also, remember to scope existing hover effects using `:not(:disabled):hover` (e.g. `.knd-btn-action:not(:disabled):hover`) so the disabled state remains visually static when hovered.
