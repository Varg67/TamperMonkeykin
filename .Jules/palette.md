## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-06-24 - Async Loading States
**Learning:** Users lack visual feedback and can inadvertently trigger duplicate API requests if asynchronous buttons do not enter a disabled/loading state during fetch operations.
**Action:** Always provide visual feedback by appending a disabled state (`:disabled` CSS with overridden hover rules) and dynamically cache/restore the original `textContent` inside a `try/finally` block to prevent hardcoded string bugs.
