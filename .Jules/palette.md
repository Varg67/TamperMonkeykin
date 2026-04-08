## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-04-08 - Async Submit and Keyboard Navigation Polish
**Learning:** Not handling disabled states during async operations opens the app to duplicate submissions and unexpected race conditions while omitting explicit focus styles on custom controls hurts keyboard navigation.
**Action:** For network requests, always disable trigger buttons and display a loading text ("SENDING..." or "..."), reliably reverting this state in a `finally` block. Apply `:focus-visible` and `:disabled` CSS pseudo-classes to interactive custom elements to meet standard accessibility requirements.
