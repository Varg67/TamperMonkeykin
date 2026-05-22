const simulateObserver = (nodeText) => {
    let parserCalled = false;
    const text = nodeText || "";
    if (!text.includes('"loc"')) return false;

    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const jsonStr = text.substring(startIdx, endIdx + 1);
        if (jsonStr.includes('"loc"')) {
            parserCalled = true;
            return true;
        }
    }
    return false;
};

const text1 = 'The word "loc" is here. {"other": "data"}';
console.log("Text 1:", simulateObserver(text1)); // should be false, since jsonStr doesn't contain "loc"

const text2 = 'Here is some text. {"loc": "The Park", "A_mod": 10}';
console.log("Text 2:", simulateObserver(text2)); // should be true
