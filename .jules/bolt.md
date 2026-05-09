## 2024-05-18 - [Preventing Layout Thrashing in MutationObservers]
**Learning:** Found a performance bottleneck in `cinematic-rp-extension-beta0.2.user.js` where a `MutationObserver` used `node.textContent || node.innerText || ""`. Accessing `innerText` forces a synchronous layout recalculation (reflow), which is extremely expensive when executed repeatedly on every added node. Furthermore, a heavy regex was being run on every text node.
**Action:** Removed the `innerText` fallback and introduced an early return fast-path (`if (!text.includes('"loc"')) return;`) to bypass the regex when the target keyword is absent. Always prefer `textContent` in observers to avoid layout thrashing, and use cheap string checks before expensive regex operations.
## 2024-05-19 - [O(N) String Operations for JSON Extraction]
**Learning:** Found a performance bottleneck where a greedy regex (`/\{[\s\S]*"loc"[\s\S]*\}/g`) caused catastrophic backtracking on long text nodes.
**Action:** Replaced with O(N) string operations using `indexOf('{')` and `lastIndexOf('}')` to safely and quickly isolate content boundaries.
