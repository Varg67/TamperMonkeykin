## 2024-05-18 - [Preventing Layout Thrashing in MutationObservers]
**Learning:** Found a performance bottleneck in `cinematic-rp-extension-beta0.2.user.js` where a `MutationObserver` used `node.textContent || node.innerText || ""`. Accessing `innerText` forces a synchronous layout recalculation (reflow), which is extremely expensive when executed repeatedly on every added node. Furthermore, a heavy regex was being run on every text node.
**Action:** Removed the `innerText` fallback and introduced an early return fast-path (`if (!text.includes('"loc"')) return;`) to bypass the regex when the target keyword is absent. Always prefer `textContent` in observers to avoid layout thrashing, and use cheap string checks before expensive regex operations.
## 2024-05-19 - [O(N) string operations for JSON parsing]
**Learning:** Using greedy regex `/\{[\s\S]*"loc"[\s\S]*\}/g` for finding JSON in long text nodes can cause catastrophic backtracking and ReDoS.
**Action:** Replace greedy regex searches with safe O(N) string operations like `indexOf('{')` and `lastIndexOf('}')` to isolate boundaries, then verify the content with a simple `.includes()`.
