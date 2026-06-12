## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-04-07 - Async UI Feedback
**Learning:** For asynchronous operations (like API requests) attached to UI buttons, failing to indicate loading state combined with no disablement causes duplicate submissions and poor visual feedback. This leaves users unsure if their click registered.
**Action:** Always wrap API calls attached to buttons in a `try/finally` block. Dynamically cache the original `textContent`, mutate it to indicate loading, disable the button during the fetch, and restore its state in the `finally` clause, adding `:disabled` scoped CSS to override `:hover` styling.
