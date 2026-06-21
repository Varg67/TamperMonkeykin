## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-18 - Async Button State & Accessibility
**Learning:** For asynchronous API operations, users can trigger duplicate requests and lack visual feedback if buttons don't enter a disabled state. Hardcoding replacement text is brittle and loses the original translation/intent.
**Action:** Always wrap API calls in `try/finally` blocks to guarantee UI restoration. Use `:disabled` CSS pseudo-classes to fade the button, and cache the button's `e.currentTarget.textContent` dynamically instead of hardcoding the original string when toggling to a loading indicator. Ensure `:hover` styles are scoped with `:not(:disabled)` to prevent hover feedback on inactive buttons.
