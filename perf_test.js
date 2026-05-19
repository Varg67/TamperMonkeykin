const text = "A".repeat(50000) + '{"loc": "The Park", "A_mod": 10}' + "B".repeat(50000);

console.time("regex");
const regex = /\{[\s\S]*"loc"[\s\S]*\}/g;
const matches = text.match(regex);
console.timeEnd("regex");

console.time("string");
const startIdx = text.indexOf('{');
const endIdx = text.lastIndexOf('}');
if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const jsonStr = text.substring(startIdx, endIdx + 1);
    if (jsonStr.includes('"loc"')) {
        // match
    }
}
console.timeEnd("string");
