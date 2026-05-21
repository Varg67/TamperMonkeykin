## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-05-21 - Async Button Loading States
**Learning:** Missing loading and disabled states on async buttons (like memory saving or API pinging) leads to duplicate clicks and frustrated users. Setting button text synchronously on click provides immediate interaction feedback.
**Action:** Always add loading visual feedback by dynamically caching `textContent`, setting `disabled = true`, applying `:disabled` CSS (with overridden hover effects), and restoring states within a `try/finally` block.
