## 2024-05-18 - [Preventing Layout Thrashing in MutationObservers]
**Learning:** Found a performance bottleneck in `cinematic-rp-extension-beta0.2.user.js` where a `MutationObserver` used `node.textContent || node.innerText || ""`. Accessing `innerText` forces a synchronous layout recalculation (reflow), which is extremely expensive when executed repeatedly on every added node. Furthermore, a heavy regex was being run on every text node.

**Action:** Removed the `innerText` fallback and introduced an early return fast-path (`if (!text.includes(loc)) return;`) to bypass the regex when the target keyword is absent. Always prefer `textContent` in observers to avoid layout thrashing, and use cheap string checks before expensive regex operations.

## 2026-06-15 - [Caching state for redundant DOM updates]
**Learning:** In `cinematic-rp-extension-beta0.2.user.js`, the visual state of a stat's 10-block UI in `renderState` is entirely derived from `stat.val`. Updating DOM nodes indiscriminately on every render cycle causes unnecessary layout thrashing.
**Action:** Implement DOM write caching by storing `stat.val` in a `lastRenderState` object. Before updating the DOM, check if the stat has changed to safely skip redundant block iteration.
