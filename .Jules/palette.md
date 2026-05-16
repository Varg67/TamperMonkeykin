## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-24 - Async Loading States
**Learning:** The previous async buttons lacked clear disabled/loading states causing confusion. Adding dynamic text swap + disabled states improves usability by preventing multiple clicks.
**Action:** Used text swap (SENDING..., ...) and button disabling (`:disabled`) dynamically.
