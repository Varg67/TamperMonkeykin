## 2024-04-07 - URL Parameter and Header Injection Risks in Userscripts
**Vulnerability:** Untrusted input (`targetVal`) injected directly into URL query parameters (`gemini-2.5-flash:generateContent?key=${targetVal}`) and HTTP Authorization Headers (`Bearer ${gameState.apiKeys.k}`). Error objects from JSON parsing were directly logged to the console.
**Learning:** Userscripts interfacing with external APIs and parsing DOM-based data must validate, sanitize, and encode data precisely as server-side code would. Unsanitized input into query strings can lead to SSRF or parameter pollution, and newlines in tokens can lead to HTTP Header Injection. Furthermore, directly printing unvalidated JSON payloads to `console.error` can lead to log injection or log-based XSS depending on the browser console implementation.

## 2026-06-23 - API Key DOM Exposure
**Vulnerability:** API keys were loaded directly into the `value` attribute of input elements (`document.getElementById('inp-api-k').value = savedKeys.k;`). Although the inputs used `type="password"`, the plaintext keys were still accessible via DOM extraction by malicious host page scripts.
**Learning:** Setting sensitive data directly into the DOM (even in a password input) exposes it to the host environment.
**Prevention:** Store credentials securely in memory/storage, and use a dummy mask string (e.g., `••••••••••••••••`) in the DOM for visual feedback. Implement helper functions that fall back to the in-memory key if the mask is present.
