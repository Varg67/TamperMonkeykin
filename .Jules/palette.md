## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-28 - Async Button Feedback Update
**Learning:** Missing loading states and unhandled `:disabled` attributes on async buttons (like API ping or Journal send) cause user confusion, layout shifts, and potentially duplicate requests.
**Action:** Always handle `:disabled` states, scope `:hover` styles to `:not(:disabled)` to prevent visual feedback on inactive elements, and wrap API calls in `try/finally` blocks to guarantee UI restoration.
