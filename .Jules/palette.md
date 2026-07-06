## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-07-06 - Async Form Submission States
**Learning:** Missing `:disabled` states and loading feedback on action buttons can cause duplicate api submissions and confusion.
**Action:** Cache the button's `textContent`, set to a loading string, apply the `disabled` property during the action, and use a `try/finally` block to restore the original state securely.
