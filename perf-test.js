const text = "A".repeat(100000) + '{"loc": "The Park", "A_mod": 10}' + "B".repeat(100000);

console.time("regex");
const regex = /\{[\s\S]*"loc"[\s\S]*\}/g;
const matches = text.match(regex);
const jsonStr1 = matches[matches.length - 1];
console.timeEnd("regex");

console.time("indexOf");
let startIdx = text.indexOf('{');
let endIdx = text.lastIndexOf('}');
if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    const jsonStr2 = text.substring(startIdx, endIdx + 1);
}
console.timeEnd("indexOf");
