## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-06-26 - Async Operation Button Feedback
**Learning:** Users often double-click buttons or become confused if there is no immediate visual feedback during asynchronous API requests or saves. Failing to disable these buttons can lead to duplicate requests or undesirable state changes.
**Action:** Always provide visual feedback (e.g., text changes like 'SAVING...') and apply `:disabled` states to buttons during async operations. Wrap the async calls in a `try/finally` block to ensure the button's original text and enabled state are reliably restored.
