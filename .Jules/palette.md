## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-04-17 - Async Button Visual Feedback
**Learning:** Users lack confidence when triggering long-running asynchronous actions (like saving API keys or pinging endpoints) if buttons don't provide immediate visual feedback. Missing ':disabled' states can lead to duplicate submissions and broken UI states.
**Action:** Ensure all interactive elements that trigger network requests add explicit loading text and leverage ':disabled' CSS states (e.g., lower opacity, not-allowed cursor, disabled hover effects). Crucially, wrap asynchronous logic in 'try/finally' blocks so buttons are safely restored regardless of success or failure.
