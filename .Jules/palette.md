## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-18 - Async Button Loading States
**Learning:** Users lack feedback when an async API call is made from a custom button, potentially causing double submissions. Also, `:hover` styles on `:disabled` elements create false interactive affordances.
**Action:** Always wrap API calls in custom buttons with a `try/finally` block to reliably handle the `:disabled` state, dynamically cache the original text content before replacing it with a loading indicator, and strictly apply `:not(:disabled)` pseudo-classes to `:hover` styles.
