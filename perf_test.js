const text = "Some text before the json " + " ".repeat(100000) + '{"loc": "Paris", "data": "Some data"}' + " ".repeat(100000) + " some text after";

console.time("Regex");
for(let i=0; i<100; i++) {
    const regex = /\{[\s\S]*"loc"[\s\S]*\}/g;
    const matches = text.match(regex);
    if (matches && matches.length > 0) {
        const jsonStr = matches[matches.length - 1];
    }
}
console.timeEnd("Regex");

console.time("IndexOf");
for(let i=0; i<100; i++) {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
        const jsonStr = text.substring(firstBrace, lastBrace + 1);
    }
}
console.timeEnd("IndexOf");
