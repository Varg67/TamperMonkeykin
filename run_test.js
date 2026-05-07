const simulateObserver = (nodeText) => {
    let parserCalled = false;
    const parseLLMPayload = (jsonStr) => {
        parserCalled = true;
    };

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

const test = (name, text, shouldParse) => {
    const result = simulateObserver(text);
    console.log(`${result === shouldParse ? '✅' : '❌'} ${name}`);
}

test("Empty text", "", false);
test("Text without loc", "Hello world, what a nice day.", false);
test("Text with loc but no JSON", 'The word "loc" is here.', false);
test("Valid JSON payload", 'Here is some text. {"loc": "The Park", "A_mod": 10}', true);
test("Invalid JSON format but has loc", '{"loc": "Beach"', false);
