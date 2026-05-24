## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-24 - Async Button Visual Feedback & Disabled States
**Learning:** Users lack visual feedback and interaction safeguards during long-running async operations, leading to potential duplicate submissions. Hover styles also improperly activate on inactive elements if not scoped.
**Action:** Always wrap async API calls in `try/finally` blocks to restore cached `textContent` and `disabled` states using `e.currentTarget`, and ensure custom button `:hover` states are scoped with `:not(:disabled)`.
