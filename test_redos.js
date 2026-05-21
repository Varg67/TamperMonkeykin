const simulateObserverOld = (nodeText) => {
    const text = nodeText || "";
    if (!text.includes('"loc"')) return false;

    const regex = /\{[\s\S]*"loc"[\s\S]*\}/g;
    const matches = text.match(regex);
    return !!matches;
};

const text = '{"' + 'a'.repeat(50000) + '"loc"';
const start = Date.now();
simulateObserverOld(text);
console.log('Time taken:', Date.now() - start, 'ms');
