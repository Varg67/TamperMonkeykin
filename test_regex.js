const text = 'Here is some text. {"loc": "The Park", "A_mod": 10} Then some more text. {"loc": "The Park 2", "A_mod": 20}';
const regex = /\{[\s\S]*"loc"[\s\S]*\}/g;
const matches = text.match(regex);
console.log("Regex matches:", matches);
if (matches) {
    console.log("JSON parse result:", JSON.parse(matches[matches.length - 1]));
}
