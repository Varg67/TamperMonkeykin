## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-23 - Async UI Feedback on Custom Buttons
**Learning:** Custom UI buttons in this userscript lack native `:disabled` styles and trigger `:hover` active visual states even when logically inactive during async operations.
**Action:** Always scope `:hover` styles with `:not(:disabled)` in CSS and dynamically cache a button's `textContent` before mutating it for loading states, ensuring reliable restoration in a `try/finally` block.
