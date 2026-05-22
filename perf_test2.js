const badText = 'Here is some context {"loc": "The Park" \n'.repeat(100) + '... ' + 'and some trailing text '.repeat(1000);

console.time('regex_bad');
for (let i = 0; i < 100; i++) {
    const matches = badText.match(/\{[\s\S]*"loc"[\s\S]*\}/g);
}
console.timeEnd('regex_bad');

console.time('indexOf_bad');
for (let i = 0; i < 100; i++) {
    const startIdx = badText.indexOf('{');
    const endIdx = badText.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const jsonStr = badText.substring(startIdx, endIdx + 1);
        if (jsonStr.includes('"loc"')) {
            // found
        }
    }
}
console.timeEnd('indexOf_bad');
