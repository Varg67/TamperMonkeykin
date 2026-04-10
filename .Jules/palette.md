## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-04-10 - Async Operations Feedback and Prevention
**Learning:** Missing loading and disabled states during asynchronous operations like fetch requests leads to duplicate submissions and poor user trust. Buttons must visually indicate activity and prevent repeated clicks while the application waits for a response.
**Action:** Always wrap async API calls in `try/finally` blocks, immediately disable associated `button`s and apply loading text/styles on submission, and guarantee restoration in the `finally` block.
