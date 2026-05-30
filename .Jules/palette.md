## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-05-30 - Async Button Visual Feedback
**Learning:** Users lack visibility during asynchronous network operations, which can lead to duplicate submissions and a poor experience. The UI needs explicit feedback during these wait times.
**Action:** Always handle `:disabled` states and provide visual feedback (e.g., updating button text to "SENDING..." or using spinners) during asynchronous operations. Wrap API calls in `try/finally` blocks to guarantee UI restoration (e.g. re-enabling the button and reverting original text), and ensure `:hover` styles are overridden for `:disabled` states using `:not(:disabled)` so inactive elements do not react to interaction.
