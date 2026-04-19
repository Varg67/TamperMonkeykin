const oldRegex = /\{[\s\S]*"loc"[\s\S]*\}/g;
const text = "A".repeat(50000) + '{' + "B".repeat(50000) + "loc" + "C".repeat(50000) + '}' + "D".repeat(50000);
const badText = "A".repeat(50000) + '{' + "B".repeat(150000); // no closing brace

console.time("Old Regex Good");
text.match(oldRegex);
console.timeEnd("Old Regex Good");

console.time("Old Regex Bad");
badText.match(oldRegex);
console.timeEnd("Old Regex Bad");

console.time("New String Search Good");
const firstBrace = text.indexOf('{');
const lastBrace = text.lastIndexOf('}');
if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const jsonStr = text.substring(firstBrace, lastBrace + 1);
    if (jsonStr.includes('"loc"')) {}
}
console.timeEnd("New String Search Good");

console.time("New String Search Bad");
const fb = badText.indexOf('{');
const lb = badText.lastIndexOf('}');
if (fb !== -1 && lb !== -1 && lb > fb) {
    const jsonStr = badText.substring(fb, lb + 1);
    if (jsonStr.includes('"loc"')) {}
}
console.timeEnd("New String Search Bad");
