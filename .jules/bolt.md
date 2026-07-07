## 2024-05-18 - [Preventing Layout Thrashing in MutationObservers]
**Learning:** Found a performance bottleneck in `cinematic-rp-extension-beta0.2.user.js` where a `MutationObserver` used `node.textContent || node.innerText || ""`. Accessing `innerText` forces a synchronous layout recalculation (reflow), which is extremely expensive when executed repeatedly on every added node. Furthermore, a heavy regex was being run on every text node.
**Action:** Removed the `innerText` fallback and introduced an early return fast-path (`if (!text.includes('"loc"')) return;`) to bypass the regex when the target keyword is absent. Always prefer `textContent` in observers to avoid layout thrashing, and use cheap string checks before expensive regex operations.
## 2024-05-18 - [Preventing Layout Thrashing in renderState]
**Learning:** High-frequency UI updates in `renderState` can cause layout thrashing if the DOM is updated repeatedly with the same values.
**Action:** Implement an in-memory `lastRenderState` cache to track primitive values (`stat.val`, `loc`, `tokens`) and use early returns to bypass redundant DOM modifications.
