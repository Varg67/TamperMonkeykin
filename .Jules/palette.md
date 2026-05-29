## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-29 - Async Button State Feedback
**Learning:** Missing loading indicators and disabled states on async buttons (like the Journal "SEND TO MEMORY" button) lead to duplicate submissions and user confusion.
**Action:** Implement `:disabled` CSS states with `:not(:disabled)` hover scoping. Use `e.currentTarget` to cache initial button text, apply a loading state (e.g., "SENDING..."), disable the button, and ensure safe restoration within a `try/finally` block.
