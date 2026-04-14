## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-04-14 - Async Button UI States
**Learning:** Failing to handle async UI states leaves buttons clickable during network requests, leading to duplicate submissions and confusing user experiences.
**Action:** Always wrap async API calls in `try/finally` blocks, update the `:disabled` state and button text before the request, and ensure the button restores its original state in the `finally` block.
