const regexMethod = (text) => {
    if (!text.includes('"loc"')) return false;
    const regex = /\{[\s\S]*"loc"[\s\S]*\}/g;
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
        return matches[matches.length - 1];
    }
    return null;
};

const stringMethod = (text) => {
    if (!text.includes('"loc"')) return false;
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const jsonStr = text.substring(startIdx, endIdx + 1);
        if (jsonStr.includes('"loc"')) {
            return jsonStr;
        }
    }
    return null;
};

const longText = "a".repeat(10000) + '{"loc": "The Park", "A_mod": 10}' + "b".repeat(10000);

console.time('regexMethod');
for (let i = 0; i < 1000; i++) {
    regexMethod(longText);
}
console.timeEnd('regexMethod');

console.time('stringMethod');
for (let i = 0; i < 1000; i++) {
    stringMethod(longText);
}
console.timeEnd('stringMethod');
