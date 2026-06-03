## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-06-03 - Asynchronous Button Disabled States
**Learning:** Users lack visual feedback and can accidentally trigger duplicate submissions if asynchronous operations (like API calls) are bound to buttons without immediate UI state changes, breaking the user experience and potentially causing race conditions.
**Action:** Always handle `:disabled` states and provide visual feedback (e.g., dynamically changing text to "SENDING..." or "...") during asynchronous operations, ensuring you cache the initial `textContent` before mutation and use a `try/finally` block to safely restore the original text and enable state. Use `e.currentTarget` in event listeners to safely reference the bound button.
