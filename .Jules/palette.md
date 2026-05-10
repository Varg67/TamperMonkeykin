## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-04-08 - Async Button States & Fallback
**Learning:** Hardcoding string restorations when toggling async loading text (e.g., changing 'SEND' to 'SENDING...') causes text regressions if the default UI was modified elsewhere. Furthermore, omitting disabled states on interactive elements during async logic allows users to repeatedly trigger actions, which is confusing and could lead to duplicate API submissions.
**Action:** Always wrap async operations in `try/finally` blocks to guarantee restoration. Instead of hardcoding text, dynamically capture the starting text (e.g., `const originalText = e.currentTarget.textContent`) before mutation, and restore it safely. Implement `:disabled` states on buttons that prevent pointer events and show diminished opacity.
