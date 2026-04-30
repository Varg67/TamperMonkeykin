## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-15 - Async Operation Micro-Interactions
**Learning:** Hardcoding static assumed text like "SEND" or "PING" when attempting to restore a button's label after an asynchronous action is brittle, especially if components are localized or reused. Additionally, if an API call throws an error and no `finally` block exists, the button might remain stuck in a disabled or "Loading..." state indefinitely, breaking the UI.
**Action:** Always dynamically cache the element's original `textContent` into a variable *before* updating its state to indicate loading (e.g. `SENDING...`), and strictly use a `try/finally` block to restore `disabled = false` and `.textContent = originalText` regardless of whether the API call succeeds or fails.
