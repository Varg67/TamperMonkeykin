## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## $(date +%Y-%m-%d) - Async Button Loading States
**Learning:** Users lack feedback during asynchronous API requests, leading to duplicate submissions. Additionally, applying `:disabled` CSS states requires overriding `:hover` styles with `:not(:disabled)` to prevent misleading interactive cues on inactive elements.
**Action:** Always wrap async operations in a `try/finally` block to reliably restore the button's cached initial `textContent` and re-enable it. Use `e.currentTarget` to safely reference the bound element, and ensure CSS `:hover` states are explicitly scoped away from `:disabled` elements.
