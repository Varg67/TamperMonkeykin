## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-06-22 - Async Button Visual Feedback & State Management
**Learning:** Users lack visual feedback during asynchronous API actions (like saving memory), leading to confusion and duplicate submissions. Simply adding `disabled` state is insufficient if CSS `:hover` states still trigger, creating a disconnected UX.
**Action:** Always implement dynamic text changes (e.g., 'SENDING...') and `:disabled` attribute toggling during async operations, wrapped in `try/finally` blocks to guarantee UI restoration. Scope button hover styles using `:not(:disabled):hover` to prevent active visual feedback on inactive elements.
