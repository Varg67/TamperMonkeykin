## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-18 - Async Loading States & Disabled Controls
**Learning:** Hardcoding original button text when restoring UI state after an async operation often leads to bugs if the text was dynamically set or translated elsewhere. Similarly, relying on `:hover` states for visually disabled buttons (`:disabled`) confuses users because the element still appears interactive.
**Action:** Always dynamically cache a button's `textContent` before mutating it for a loading state, and safely restore it within a `try/finally` block. Ensure `:hover` styles on custom buttons are overridden or scoped using `:not(:disabled)` so inactive elements remain visually inactive. Use `e.currentTarget` to safely reference the button in event listeners.
