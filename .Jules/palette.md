## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-06-11 - Async Action Button States
**Learning:** Without explicit loading and disabled states, users may click action buttons multiple times during slow API calls, leading to duplicate submissions and a confusing UX.
**Action:** Always implement disabled states (`:disabled` CSS overrides) and use a `try/finally` block to dynamically cache original button text and safely restore it alongside re-enabling the button after async operations complete.
