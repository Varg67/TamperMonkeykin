## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-06 - Async Button Feedback Pattern
**Learning:** Disabling buttons during network requests prevents duplicate submissions, and modifying button text provides necessary feedback. It's crucial to cache the initial `textContent` before mutation and restore it in a `try/finally` block to guarantee UI restoration even if the request fails.
**Action:** Always implement `:disabled` states with CSS scoped using `:not(:disabled):hover`, and wrap async logic in `try/finally` to safely revert cached button labels and states.
