const longText = 'Here is some context that is quite long. '.repeat(1000) + '{"loc": "The Park", "A_mod": 10}' + ' and some trailing text '.repeat(1000);

console.time('regex');
for (let i = 0; i < 1000; i++) {
    const matches = longText.match(/\{[\s\S]*"loc"[\s\S]*\}/g);
    if (matches && matches.length > 0) {
        const jsonStr = matches[matches.length - 1];
    }
}
console.timeEnd('regex');

console.time('indexOf');
for (let i = 0; i < 1000; i++) {
    const startIdx = longText.indexOf('{');
    const endIdx = longText.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const jsonStr = longText.substring(startIdx, endIdx + 1);
        if (jsonStr.includes('"loc"')) {
            // found
        }
    }
}
console.timeEnd('indexOf');
