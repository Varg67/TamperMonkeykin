## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-31 - Async Button States & UX Feedback
**Learning:** Failing to handle `:disabled` states and providing visual feedback (like 'SENDING...') during asynchronous operations can lead to duplicate submissions and a confusing user experience. Global `:hover` rules can also erroneously apply to these disabled states, providing false interaction cues.
**Action:** Always handle `:disabled` states and provide visual text/loading feedback during async API calls. Wrap the operations in `try/finally` blocks to guarantee the UI is restored, and use `:not(:disabled)` on hover rules to prevent active visual feedback on inactive elements.
