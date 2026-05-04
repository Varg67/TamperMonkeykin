## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2024-04-08 - Async Button States & UI Recovery
**Learning:** In purely frontend Tampermonkey scripts making external API calls (e.g., via `GM_xmlhttpRequest`), failing to disable buttons during async operations leads to duplicate submissions. Furthermore, hardcoding restoration strings can break UI if translations or dynamic text exist.
**Action:** Always add visual feedback (e.g., "..." or "SENDING...") and set `.disabled = true` on action buttons when starting async tasks. Dynamically cache the element's initial `textContent` before mutation, and use a `try/finally` block to safely restore the exact original text and `.disabled = false` state, ensuring UI recovery even if the API fails.
