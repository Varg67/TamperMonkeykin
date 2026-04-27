## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-04-27 - Disabled Button Styles & Async Feedback
**Learning:** Adding `:disabled` to a button isn't enough if the CSS has a blanket `:hover` rule that triggers active visual feedback (like color or background changes). Additionally, modifying button text for loading states requires dynamic caching of the initial state rather than hardcoding.
**Action:** When creating custom buttons, always scope the hover state using `:not(:disabled):hover` to prevent active feedback on inactive buttons. When providing loading feedback, cache the element's initial `textContent` before mutating it, and ensure it is restored in a `try/finally` block to guarantee UI restoration.
