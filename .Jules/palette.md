## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-24 - Async UI Loading States
**Learning:** Users lack feedback when an async submission takes time, and without disabling the button, they might click it multiple times causing duplicate API requests.
**Action:** Added a loading state (disabled button with "SENDING..." text) to the Journal submission using a `try/finally` block to ensure UI restoration. Added `:disabled` CSS states handling to prevent hover feedback on inactive elements.
