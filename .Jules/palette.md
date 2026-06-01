## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-10-24 - Async Button UX with Disabled States
**Learning:** Users can accidentally double-submit or become confused when long-running asynchronous actions (like sending entries to an API) lack visual feedback on the button itself.
**Action:** Always implement `:disabled` CSS states with `cursor: not-allowed` and opacity adjustments. During async operations, dynamically swap the button's textContent to a loading state, disable the button, and use a try/finally block to guarantee the original text and enabled state are restored. Use `e.currentTarget` to safely reference the button.
