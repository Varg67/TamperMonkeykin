## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-04-18 - Async Loading & Disabled States
**Learning:** Users lack feedback during asynchronous Tampermonkey scripts (like fetching or saving settings), and double-clicking API ping or submit buttons can lead to duplicate network requests and UI errors.
**Action:** Always implement `:disabled` state styling on buttons (with `:not(:disabled)` on hover effects), and wrap API calls in `try/finally` blocks to guarantee UI restoration (changing button text and re-enabling the button) even if network requests fail.
