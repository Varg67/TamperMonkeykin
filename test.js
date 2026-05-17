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

    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const jsonStr = text.substring(startIdx, endIdx + 1);
        if (jsonStr.includes('"loc"')) {
            parseLLMPayload(jsonStr);
            return true;
        }
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
test("Text with braces but loc outside", '{ "other": 1 } and "loc"', false);

console.log(`\nTests: ${passed}/${total} passed`);

if (passed !== total) {
    process.exit(1);
}
