## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-04-28 - Async Button State Resilience
**Learning:** Hardcoding assumed strings like "PING" or "SEND TO MEMORY" to restore button states after async operations is brittle if the initial string is dynamically set or multi-lingual.
**Action:** Always dynamically cache the element's initial `textContent` before mutation and use a `try/finally` block to safely restore the original text and remove the `:disabled` state, guaranteeing recovery even when requests throw errors.
