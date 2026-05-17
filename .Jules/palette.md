## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-17 - Async Loading States for Buttons
**Learning:** For asynchronous actions, users lack feedback during API operations. Without dynamic UI feedback or a disabled state, duplicate submissions or confusion may occur, particularly if the request takes a few seconds.
**Action:** Always handle `:disabled` states dynamically for async API buttons. Change the button's text to a loading state (e.g., 'SENDING...'), use a `try/finally` block to guarantee restoration of original visual state regardless of API success/failure, and apply `:not(:disabled)` inside CSS hover rules to prevent hover visual cues on inactive components.
