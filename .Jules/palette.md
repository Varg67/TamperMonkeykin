## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-02 - Async Button Loading & Disabled States
**Learning:** During asynchronous operations (like API calls), users can repeatedly click active buttons leading to duplicate submissions or confusion if visual feedback is missing. Adding `:disabled` CSS states alone is insufficient if the active `:hover` state still applies to disabled elements.
**Action:** Wrap async operations in a `try/finally` block. Dynamically cache the button's initial `textContent` before setting it to a loading string (e.g., 'SENDING...') and `disabled = true`, then guarantee restoration in the `finally` block. Ensure CSS explicitly scopes hover effects using `:not(:disabled)` to prevent active feedback on inactive buttons.
