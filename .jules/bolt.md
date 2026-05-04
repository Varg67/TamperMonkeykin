## 2024-05-18 - [Preventing Layout Thrashing in MutationObservers]
**Learning:** Found a performance bottleneck in `cinematic-rp-extension-beta0.2.user.js` where a `MutationObserver` used `node.textContent || node.innerText || ""`. Accessing `innerText` forces a synchronous layout recalculation (reflow), which is extremely expensive when executed repeatedly on every added node. Furthermore, a heavy regex was being run on every text node.
**Action:** Removed the `innerText` fallback and introduced an early return fast-path (`if (!text.includes('"loc"')) return;`) to bypass the regex when the target keyword is absent. Always prefer `textContent` in observers to avoid layout thrashing, and use cheap string checks before expensive regex operations.
## 2024-05-18 - [Preventing ReDoS in JSON Extraction]
**Learning:** The greedy regex `/\{[\s\S]*"loc"[\s\S]*\}/g` was causing performance issues and potential ReDoS when parsing long text nodes in the MutationObserver.
**Action:** Replaced the regex with O(N) string operations (`indexOf` and `lastIndexOf`) coupled with a `.includes` check to safely and quickly extract JSON boundaries.
