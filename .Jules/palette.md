## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-04-13 - Async Button Disabled States
**Learning:** Missing disabled states and visual feedback on asynchronous action buttons can lead to duplicate submissions and user confusion. Additionally, default hover states often remain active on disabled elements, providing conflicting visual cues.
**Action:** Always wrap async operations in a `try/finally` block to manage the button's `:disabled` state and provide textual feedback (e.g., 'SENDING...'). Use the `:not(:disabled)` pseudo-class for hover styles to prevent active visual feedback on inactive buttons.
