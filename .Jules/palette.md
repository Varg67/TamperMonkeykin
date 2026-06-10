## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-06-10 - Async Button State Feedback
**Learning:** Hardcoding original button text strings when implementing loading states is brittle and does not scale well if text contents vary dynamically or are localized. Users can also double submit actions if they are not disabled properly.
**Action:** When modifying button text for asynchronous loading states, dynamically cache the element's initial `textContent` before mutation instead of hardcoding assumed strings, and use the cached variable to safely restore the original text in a `try/finally` block. Override `:hover` styles with `:not(:disabled)` to prevent active feedback on inactive components.
