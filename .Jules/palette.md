## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-24 - Async Button Loading States
**Learning:** Users lack feedback when saving journal entries, which could lead to duplicate submissions. Implementing a loading state with disabled buttons improves UX and prevents double-clicking.
**Action:** Always add a loading state (e.g., "SENDING...") and disable action buttons during async operations. Ensure `finally` blocks restore the original state so users can retry if it fails.
