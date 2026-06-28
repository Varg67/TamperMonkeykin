## 2024-05-18 - [Preventing Layout Thrashing in MutationObservers]
**Learning:** Found a performance bottleneck in `cinematic-rp-extension-beta0.2.user.js` where a `MutationObserver` used `node.textContent || node.innerText || ""`. Accessing `innerText` forces a synchronous layout recalculation (reflow), which is extremely expensive when executed repeatedly on every added node. Furthermore, a heavy regex was being run on every text node.

## 2026-06-28 - [Preventing Redundant DOM Iterations with State Caching]
**Learning:** High-frequency UI updates in `renderState` can cause layout thrashing and unnecessary DOM manipulation.
**Action:** Caching primitive values (`stat.val`, `loc`, `tokens`) in an in-memory `lastRenderState` object allows for early returns per state piece, safely bypassing redundant DOM iterations.
