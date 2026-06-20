## 2024-04-07 - Accessible Form & Icon Buttons Update
**Learning:** Purely visual DOM structures, such as using `span` for buttons or implicit `label` proximity without the `for` attribute, cause screen readers to ignore interactions and field descriptions. This UI component pattern required explicit element upgrades.
**Action:** Always replace icon-only `span` controls with proper `<button>` elements including `aria-label`s, and ensure every `<label>` uses the `for` attribute bound to its associated `<input>` ID. Also ensure that custom control buttons use `:focus-visible` styles for better keyboard accessibility.

## 2025-01-20 - Async Loading States for Action Buttons
**Learning:** For async operations, buttons need visual feedback and state management. Users repeatedly click or wonder if an action worked when there's no loading indicator or disabled state.
**Action:** Dynamically disable the button, modify text content, and wrap the API request in a `try...finally` block to restore original state and text, preventing duplicate submissions and ensuring the UI remains robust.
