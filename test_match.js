const simulateObserver = (nodeText) => {
    const text = nodeText || "";
    if (!text.includes('"loc"')) return false;

    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const jsonStr = text.substring(startIdx, endIdx + 1);
        if (jsonStr.includes('"loc"')) {
            return true;
        }
    }
    return false;
};

console.log(simulateObserver("")); // false
console.log(simulateObserver("Hello world, what a nice day.")); // false
console.log(simulateObserver('The word "loc" is here.')); // false
console.log(simulateObserver('Here is some text. {"loc": "The Park", "A_mod": 10}')); // true
console.log(simulateObserver('{"loc": "Beach"')); // false
