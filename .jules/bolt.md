## 2024-05-18 - [Preventing Layout Thrashing in MutationObservers]
**Learning:** Found a performance bottleneck in `cinematic-rp-extension-beta0.2.user.js` where a `MutationObserver` used `node.textContent || node.innerText || ""`. Accessing `innerText` forces a synchronous layout recalculation (reflow), which is extremely expensive when executed repeatedly on every added node. Furthermore, a heavy regex was being run on every text node.
**Action:** Removed the `innerText` fallback and introduced an early return fast-path (`if (!text.includes('"loc"')) return;`) to bypass the regex when the target keyword is absent. Always prefer `textContent` in observers to avoid layout thrashing, and use cheap string checks before expensive regex operations.
## 2025-01-20 - Prevent ReDoS in MutationObservers
**Learning:** Using greedy regexes (`/[\s\S]*/g`) inside an active MutationObserver triggers catastrophic backtracking on large, dynamically added DOM text nodes, completely locking up the main thread.
**Action:** Always prefer O(N) string methods like `indexOf` and `lastIndexOf` to isolate payloads before attempting extraction or parsing in high-frequency observer callbacks.
