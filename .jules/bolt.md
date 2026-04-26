## 2024-05-18 - [Preventing Layout Thrashing in MutationObservers]
**Learning:** Found a performance bottleneck in `cinematic-rp-extension-beta0.2.user.js` where a `MutationObserver` used `node.textContent || node.innerText || ""`. Accessing `innerText` forces a synchronous layout recalculation (reflow), which is extremely expensive when executed repeatedly on every added node. Furthermore, a heavy regex was being run on every text node.
**Action:** Removed the `innerText` fallback and introduced an early return fast-path (`if (!text.includes('"loc"')) return;`) to bypass the regex when the target keyword is absent. Always prefer `textContent` in observers to avoid layout thrashing, and use cheap string checks before expensive regex operations.

## 2024-05-19 - Regex bottlenecks inside MutationObserver
**Learning:** Using greedy regex (`/[\s\S]*/g`) to parse large or rapidly mutating DOM text strings within `MutationObserver` callbacks triggers catastrophic backtracking, causing severe main thread freezes and breaking performance.
**Action:** Always replace regex extractions with `O(N)` string boundary searches (e.g., `indexOf('{')` and `lastIndexOf('}')`) for substring isolation inside high-frequency UI observer patterns to ensure microsecond parsing efficiency.
