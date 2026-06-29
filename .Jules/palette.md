## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-06-29 - Disabled State Styling and Interaction
**Learning:** When adding `:disabled` states to custom interactive elements (like buttons with custom backgrounds), failing to override the `:hover` style allows the element to appear interactive even when disabled, creating a confusing UX.
**Action:** Always pair `.btn:disabled` opacity/cursor changes with `.btn:not(:disabled):hover` to strictly isolate interactive feedback to active states.
