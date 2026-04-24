## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-04-24 - Async Button Loading States
**Learning:** Missing loading and disabled states during asynchronous operations like API calls can lead to duplicate submissions and confused users. Using the `:disabled` attribute not only prevents these issues natively, but provides the perfect styling hook for visual feedback.
**Action:** When implementing an async API call attached to a button, always immediately disable the button and swap its text to a loading indicator. Ensure to revert this state in a `try...finally` block so the button is guaranteed to restore its interactability, and define `:disabled` styling in the CSS.
