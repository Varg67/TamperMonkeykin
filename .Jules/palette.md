## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-04-19 - Add Async Loading States & Disable Styles
**Learning:** Asynchronous API calls without disabled button states lead to poor UX and potential double-submissions from the user clicking multiple times.
**Action:** Always use `try/finally` blocks when implementing loading states for UI controls, coupled with `:disabled` CSS pseudo-classes to ensure explicit visual feedback and guarantee that interactive elements recover safely even when API promises throw errors.
