## 2024-04-07 - URL Parameter and Header Injection Risks in Userscripts
**Vulnerability:** Untrusted input (`targetVal`) injected directly into URL query parameters (`gemini-2.5-flash:generateContent?key=${targetVal}`) and HTTP Authorization Headers (`Bearer ${gameState.apiKeys.k}`). Error objects from JSON parsing were directly logged to the console.
**Learning:** Userscripts interfacing with external APIs and parsing DOM-based data must validate, sanitize, and encode data precisely as server-side code would. Unsanitized input into query strings can lead to SSRF or parameter pollution, and newlines in tokens can lead to HTTP Header Injection. Furthermore, directly printing unvalidated JSON payloads to `console.error` can lead to log injection or log-based XSS depending on the browser console implementation.
**Prevention:** Always use `encodeURIComponent()` for variables inserted into URL structures. Call `.trim()` and reject newlines for any value used in an HTTP header. Strip raw input objects before logging to the console (e.g. log static strings). Add explicit `parseFloat()` bounds to numerical logic that originates from unstructured or untrusted input (LLM JSON).

## 2026-06-04 - DOM API Key Exposure
**Vulnerability:** Injecting sensitive data (like API keys) directly into DOM attributes (e.g., input `.value`) during initialization exposes them to malicious host page scripts.
**Learning:** Empty `.value` combined with a `.placeholder` breaks the user's ability to explicitly clear the input.
**Prevention:** Populate `.value` with a dummy mask string (e.g., `••••••••••••••••`) and use a helper function that falls back to the in-memory key if the mask is present, or returns an empty string if the user intentionally cleared it.
