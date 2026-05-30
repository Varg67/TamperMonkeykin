## 2024-04-07 - URL Parameter and Header Injection Risks in Userscripts
**Vulnerability:** Untrusted input (`targetVal`) injected directly into URL query parameters (`gemini-2.5-flash:generateContent?key=${targetVal}`) and HTTP Authorization Headers (`Bearer ${gameState.apiKeys.k}`). Error objects from JSON parsing were directly logged to the console.
**Learning:** Userscripts interfacing with external APIs and parsing DOM-based data must validate, sanitize, and encode data precisely as server-side code would. Unsanitized input into query strings can lead to SSRF or parameter pollution, and newlines in tokens can lead to HTTP Header Injection. Furthermore, directly printing unvalidated JSON payloads to `console.error` can lead to log injection or log-based XSS depending on the browser console implementation.
**Prevention:** Always use `encodeURIComponent()` for variables inserted into URL structures. Call `.trim()` and reject newlines for any value used in an HTTP header. Strip raw input objects before logging to the console (e.g. log static strings). Add explicit `parseFloat()` bounds to numerical logic that originates from unstructured or untrusted input (LLM JSON).

## 2023-11-20 - DOM API Key Exposure in Userscripts
**Vulnerability:** Initializing Tampermonkey script inputs directly with sensitive API keys exposes those keys to any malicious scripts running on the host page.
**Learning:** Hardcoding or directly injecting keys into the DOM in a userscript environment is unsafe. The host environment cannot be fully trusted.
**Prevention:** Store credentials securely in memory/storage, and use a dummy mask string (e.g., `••••••••••••••••`) in the DOM for visual feedback. Validate input fields against this mask.
