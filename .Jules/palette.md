## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-24 - Async Button Loading UX
**Learning:** Users lack feedback during async operations like 'SEND TO MEMORY' and API pings in vanilla Tampermonkey scripts. Not handling `:disabled` states leads to potential duplicate submissions and poor UX. Hardcoding restored button text is fragile if the initial text changes.
**Action:** Always wrap async API calls in `try/finally` blocks to guarantee UI restoration. Dynamically cache the initial `textContent` of the button (`e.currentTarget`) before setting a loading state (e.g. 'SENDING...') and `disabled = true`. Implement generic CSS for `:disabled` opacity and cursor, and update hover states with `:not(:disabled)`.
