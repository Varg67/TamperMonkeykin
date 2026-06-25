## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-06-25 - Async Operation UI Feedback
**Learning:** Users can accidentally submit multiple requests if async action buttons (like form submissions or API pings) lack immediate visual feedback and disabled states.
**Action:** Always handle `:disabled` states and provide visual feedback (e.g., loading text like 'SENDING...') during asynchronous operations. Wrap API calls in `try/finally` blocks to guarantee UI restoration. Dynamically cache the element's initial `textContent` before mutation using `e.currentTarget` instead of hardcoding assumed strings. Ensure `:hover` styles are scoped using `:not(:disabled)`.
