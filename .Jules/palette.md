## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-18 - Async Button State and Loading Feedback
**Learning:** Asynchronous actions without visual disabled states and loading text confuse users, often leading to duplicate clicks and network thrashing. Buttons without explicit `:disabled` CSS (including overridden `:hover` states) fail to communicate inactivity properly.
**Action:** Always implement `:disabled` CSS states (ensuring `:hover` styles use `:not(:disabled)`). Wrap async API calls in `try/finally` blocks to guarantee restoration of original button text and active state, dynamically caching the button's initial `textContent` to avoid hardcoding.
