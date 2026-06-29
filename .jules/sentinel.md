## 2024-04-07 - URL Parameter and Header Injection Risks in Userscripts
**Vulnerability:** Untrusted input (`targetVal`) injected directly into URL query parameters (`gemini-2.5-flash:generateContent?key=${targetVal}`) and HTTP Authorization Headers (`Bearer ${gameState.apiKeys.k}`). Error objects from JSON parsing were directly logged to the console.
**Learning:** Userscripts interfacing with external APIs and parsing DOM-based data must validate, sanitize, and encode data precisely as server-side code would. Unsanitized input into query strings can lead to SSRF or parameter pollution, and newlines in tokens can lead to HTTP Header Injection. Furthermore, directly printing unvalidated JSON payloads to `console.error` can lead to log injection or log-based XSS depending on the browser console implementation.

## 2026-06-29 - Fix ReDoS Vulnerability in JSON Parsing
**Vulnerability:** A greedy regular expression (/{[\s\S]*"loc"[\s\S]*}/g) in the MutationObserver caused catastrophic backtracking on large text payloads.
**Learning:** Greedy regex patterns shouldn't be used to isolate content boundaries, particularly when processing unbounded or large text inputs.
**Prevention:** Use string indexing methods like indexOf and lastIndexOf to find boundaries, avoiding regular expression completely.
