## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-04-20 - Asynchronous Button Feedback & Disabled States
**Learning:** In asynchronous operations (like API pings or external journal saves), omitting visual loading feedback or disabled states leads to user confusion and duplicate submissions. This is a crucial interaction pattern lacking in standard components here.
**Action:** Always provide visual feedback (e.g., text/spinners) and handle `:disabled` states during asynchronous operations. Wrap these API calls in `try/finally` blocks to guarantee UI restoration and prevent users from getting stuck in an inactive state.
