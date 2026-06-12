## 2024-05-18 - [Preventing Layout Thrashing in MutationObservers]
**Learning:** Found a performance bottleneck in `cinematic-rp-extension-beta0.2.user.js` where a `MutationObserver` used `node.textContent || node.innerText || ""`. Accessing `innerText` forces a synchronous layout recalculation (reflow), which is extremely expensive when executed repeatedly on every added node. Furthermore, a heavy regex was being run on every text node.
**Action:** Removed the `innerText` fallback and introduced an early return fast-path (`if (!text.includes('"loc"')) return;`) to bypass the regex when the target keyword is absent. Always prefer `textContent` in observers to avoid layout thrashing, and use cheap string checks before expensive regex operations.
## 2026-06-12 - Prevent layout thrashing via DOM Write Caching
**Learning:** `renderState` redraws the entire 10-block UI on every call (even on polling), causing massive layout thrashing. Updating DOM attributes like `textContent` and `style` unnecessarily kills performance.
**Action:** Always maintain a `lastRenderState` memory cache and compare new values against it before touching the DOM, completely skipping redundant DOM writes.
