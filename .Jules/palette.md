## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-04-25 - Async UI State Restoration & Disabled Hover Scoping
**Learning:** When creating custom `<button>` components with async tasks (like API calls) in Tampermonkey scripts, failing to provide a `:disabled` state or scoping the `:hover` style allows users to trigger duplicate operations without visual feedback. Additionally, async state changes must reliably revert, regardless of success.
**Action:** Always scope interactive hover states with `:not(:disabled)` in CSS. Provide a clear `.knd-btn-action:disabled` visual state. Crucially, cache the button's initial `textContent`, set `btn.disabled = true`, and ensure the UI is restored in a `try/finally` block to guarantee recovery even when network errors or logic exceptions occur.
