## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-24 - Dynamic Loading States for Async Actions
**Learning:** Users lack feedback during background API calls in userscripts, leading to confusion and duplicate submissions. Applying explicit disabled styles and loading text ensures clear communication of background state.
**Action:** Always wrap async interactions in try/finally blocks, caching and replacing button text while applying CSS disabled states (and suppressing active hover styles via `:not(:disabled)`).
