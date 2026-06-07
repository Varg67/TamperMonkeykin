## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-06-07 - Asynchronous Button Feedback
**Learning:** Users lack visual feedback during asynchronous API actions unless explicitly coded.
**Action:** Always implement disabled states (`:disabled` CSS and attribute) and visually change text (e.g., "SENDING...") dynamically using `e.currentTarget` and `try/finally` blocks to restore state gracefully.
