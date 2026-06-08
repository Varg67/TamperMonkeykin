## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2026-06-08 - Async Button UI States Update
**Learning:** To prevent duplicate submissions and provide visual feedback during asynchronous API calls, custom buttons require disabled states and loading text. Also, hardcoding the original text can cause issues if it changes, and a failure could leave the button stuck.
**Action:** Always handle `:disabled` states visually (overriding `:hover`), dynamically cache `e.currentTarget.textContent` before mutation instead of hardcoding, and wrap async API call logic in `try/finally` blocks to guarantee restoration of the button state to `disabled = false` and original text.
