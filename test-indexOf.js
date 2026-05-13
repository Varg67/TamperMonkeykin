const simulateObserver = (nodeText) => {
    const text = nodeText || "";
    if (!text.includes('"loc"')) return false;

    let startIdx = text.indexOf('{');
    let endIdx = text.lastIndexOf('}');

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const jsonStr = text.substring(startIdx, endIdx + 1);
        if (jsonStr.includes('"loc"')) {
            return true;
        }
    }
    return false;
};

const test = (name, text, shouldParse) => {
    const result = simulateObserver(text);
    if (result === shouldParse) {
        console.log(`✅ [PASS] ${name}`);
    } else {
        console.error(`❌ [FAIL] ${name} (Expected: ${shouldParse}, Got: ${result})`);
    }
}

test("Empty text", "", false);
test("Text without loc", "Hello world, what a nice day.", false);
test("Text with loc but no JSON", 'The word "loc" is here.', false);
test("Valid JSON payload", 'Here is some text. {"loc": "The Park", "A_mod": 10}', true);
test("Invalid JSON format but has loc", '{"loc": "Beach"', false); // no closing brace

// Edge case for unrelated JSON
test("Unrelated JSON", '{"foo": "bar"} and "loc"', false);
