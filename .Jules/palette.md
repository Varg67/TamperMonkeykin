## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-07-07 - Async UI Feedback
**Learning:** Users lack visual feedback during long async API calls (like sending journals), which can lead to duplicate clicks or confusion.
**Action:** Always implement disabled states and text changes (e.g. "SENDING...") to buttons during async API calls and restore state in a `finally` block to prevent duplicate clicks and provide feedback.
