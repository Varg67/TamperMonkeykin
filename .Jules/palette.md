## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-11-09 - Async Operations Feedback and Scoped Hover States
**Learning:** Users lack feedback during asynchronous UI operations, and buttons visually appear active when hovering, leading to repeated interactions and confusion if disabled states are not strictly styled and managed in both try and finally blocks.
**Action:** Always handle `:disabled` CSS states by overriding or scoping `:hover` styles using `:not(:disabled)`. Provide clear visual loading feedback (e.g., changing text to 'SENDING...' or '...') and explicitly restore the UI inside `finally` blocks to guarantee robust state restoration.
