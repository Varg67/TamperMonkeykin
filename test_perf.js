const simulateObserverRegex = (nodeText) => {
    const text = nodeText || "";
    if (!text.includes('"loc"')) return false;
    const regex = /\{[\s\S]*"loc"[\s\S]*\}/g;
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
        return matches[matches.length - 1];
    }
    return false;
};

const simulateObserverString = (nodeText) => {
    const text = nodeText || "";
    if (!text.includes('"loc"')) return false;
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const jsonStr = text.substring(startIdx, endIdx + 1);
        if (jsonStr.includes('"loc"')) {
            return jsonStr;
        }
    }
    return false;
};

// Generate a long text node typical for RP (e.g. 5000 chars of RP text)
const rpText = "A".repeat(5000) + ' {"loc": "The Tavern", "A_mod": 5} ' + "B".repeat(5000);

let start = Date.now();
for (let i=0; i<10000; i++) {
    simulateObserverRegex(rpText);
}
console.log('Regex time:', Date.now() - start, 'ms');

start = Date.now();
for (let i=0; i<10000; i++) {
    simulateObserverString(rpText);
}
console.log('String time:', Date.now() - start, 'ms');
