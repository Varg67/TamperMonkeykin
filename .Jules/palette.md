## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-24 - Async UI Feedback & Button States
**Learning:** Users lack visual feedback and might accidentally trigger multiple network requests when interacting with async action buttons (like sending data to API) if buttons are left enabled during processing.
**Action:** To prevent duplicate submissions and improve UX, always handle `:disabled` states and provide visual feedback (e.g., loading text/spinners) during asynchronous operations. Cache the button's initial `textContent` to safely restore it in a `finally` block and scope `:hover` styles using `:not(:disabled)` to prevent active feedback on inactive elements.
