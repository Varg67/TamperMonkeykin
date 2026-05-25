## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-25 - Async Button Feedback Update
**Learning:** Actions that depend on external API requests (like "SEND TO MEMORY") often result in a perceived "frozen" UI or multiple accidental clicks if no immediate feedback is provided. Users get confused without a loading indicator.
**Action:** Always wrap async actions bound to UI buttons in `try/finally` blocks, capture the `e.currentTarget`, set `disabled = true` with a temporary text state (e.g. 'SENDING...'), and restore the original text state in the `finally` block to prevent redundant requests and indicate background progress clearly. Add appropriate CSS `:disabled` styles overrides.
