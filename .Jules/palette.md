## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-09 - Async Button Loading & Disabled States
**Learning:** Users lack feedback during asynchronous network requests, leading to potential duplicate submissions and confusion. Adding `:disabled` CSS states requires scoping `:hover` with `:not(:disabled)` to avoid active visual feedback on inactive elements.
**Action:** Always wrap async operations in `try/finally` blocks, dynamically cache original `textContent`, apply `disabled = true` and a loading string, and restore them in the `finally` block to guarantee UI restoration.
