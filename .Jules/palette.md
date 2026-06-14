## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-06-14 - Async Operations Feedback
**Learning:** Users lack visual feedback during asynchronous API operations in the settings and journal panels, which can lead to duplicate submissions and uncertainty. Simply disabling elements is insufficient without text changes.
**Action:** Always provide explicit visual feedback during async operations by setting the `:disabled` state, adding visual opacity cues, and swapping button text (e.g., 'SENDING...') using a `try/finally` block to ensure the UI gracefully restores its original state regardless of success or failure.
