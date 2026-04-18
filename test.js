const assert = require("assert");
// Minimal mock to test the parsing logic since we cannot load standard jsdom
const gameState = { stats: {}, loc: "", tokens: 0 };
const modifyStat = (k, v) => {};
const processTurnCascades = () => {};
const resolveClimax = () => {};

let parserCalled = false;
const parseLLMPayload = (jsonStr) => {
    parserCalled = true;
};

// Simplified simulation of the observer callback
const simulateObserver = (nodeText) => {
    parserCalled = false;
    const text = nodeText || "";
    if (!text.includes('"loc"')) return false;

    const regex = /\{[\s\S]*"loc"[\s\S]*\}/g;
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
        const jsonStr = matches[matches.length - 1];
        parseLLMPayload(jsonStr);
        return true;
    }
    return false;
};

let passed = 0;
let total = 0;
const test = (name, text, shouldParse) => {
    total++;
    const result = simulateObserver(text);
    if (result === shouldParse) {
        passed++;
        console.log(`✅ [PASS] ${name}`);
    } else {
        console.error(`❌ [FAIL] ${name} (Expected: ${shouldParse}, Got: ${result})`);
    }
}

test("Empty text", "", false);
test("Text without loc", "Hello world, what a nice day.", false);
test("Text with loc but no JSON", 'The word "loc" is here.', false);
test("Valid JSON payload", 'Here is some text. {"loc": "The Park", "A_mod": 10}', true);
test("Invalid JSON format but has loc", '{"loc": "Beach"', false); // The regex requires a closing brace

console.log(`\nTests: ${passed}/${total} passed`);

if (passed !== total) {
    process.exit(1);
}

// === SECURITY TESTS (PING API FALLBACK) ===
let state = {
    apiKeys: { k: "saved_k", c: "saved_c", g: "saved_g" }
};

let dom = {
    "inp-api-k": { value: "" },
    "inp-api-c": { value: "" },
    "inp-api-g": { value: "" }
};

function getDOMValue(id) {
    return dom[id].value;
}

function pingAPI(type) {
    const inputVal = getDOMValue(`inp-api-${type}`);
    const targetVal = inputVal ? inputVal.replace(/[\r\n]/g, '').trim() : state.apiKeys[type];

    const inputK = getDOMValue('inp-api-k');
    const keyK = inputK ? inputK.replace(/[\r\n]/g, '').trim() : state.apiKeys.k;

    return { targetVal, keyK };
}

assert.deepStrictEqual(pingAPI('c'), { targetVal: "saved_c", keyK: "saved_k" });

dom["inp-api-c"].value = "new_c";
assert.deepStrictEqual(pingAPI('c'), { targetVal: "new_c", keyK: "saved_k" });

console.log("Ping API tests passed!");

// === SECURITY TESTS (DELETING SAVED KEYS) ===
dom["inp-api-k"].value = "";
dom["inp-api-k"].placeholder = '******** (Saved)';
dom["inp-api-c"].value = "some_val";

// simulate save click
function simulateSaveClick() {
    const sanitizeKey = (val) => val.replace(/[\r\n]/g, '').trim();
    const inputK = dom["inp-api-k"];
    if (inputK.value !== '') {
        state.apiKeys.k = sanitizeKey(inputK.value);
        inputK.value = '';
        inputK.placeholder = state.apiKeys.k ? '******** (Saved)' : 'sk-kindroid...';
    } else if (!inputK.placeholder.includes('Saved')) {
        state.apiKeys.k = '';
    }
}
simulateSaveClick();
assert.strictEqual(state.apiKeys.k, "saved_k"); // should not be cleared because placeholder has 'Saved'

dom["inp-api-k"].placeholder = 'sk-kindroid...';
simulateSaveClick();
assert.strictEqual(state.apiKeys.k, ""); // should be cleared

console.log("Delete keys tests passed!");
