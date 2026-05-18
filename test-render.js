// Mocking DOM elements
const domCache = {
    locText: { textContent: '' },
    tokens: { textContent: '' },
    pleasureStat: { style: { display: '' } }
};
const statConfig = {
    energy: { type: 'positive', color: 'yellow', danger: 'red' },
    pleasure: { type: 'climax', color: 'pink', danger: 'red' }
};
const gameState = {
    loc: 'Home',
    tokens: 10,
    stats: {
        energy: { val: 50, type: 'positive' },
        pleasure: { val: 0, type: 'climax' }
    }
};

['energy', 'pleasure'].forEach(k => {
    domCache[`val-${k}`] = { textContent: '' };
    domCache[`blocks-${k}`] = Array(10).fill(0).map(() => ({
        className: '', style: {}, classList: { add: function(c) { this.className += ' ' + c; } }
    }));
});

let domWrites = 0;
// wrap to count
const intercept = (obj, prop) => {
    let val = obj[prop];
    Object.defineProperty(obj, prop, {
        get: () => val,
        set: (v) => { domWrites++; val = v; }
    });
};
intercept(domCache.locText, 'textContent');
intercept(domCache.tokens, 'textContent');
intercept(domCache.pleasureStat.style, 'display');
['energy', 'pleasure'].forEach(k => {
    intercept(domCache[`val-${k}`], 'textContent');
    domCache[`blocks-${k}`].forEach(b => {
        intercept(b, 'className');
        intercept(b.style, 'backgroundColor');
        intercept(b.style, 'color');
    });
});

const renderStateOptimized = () => {
    const newLoc = `📍 ${gameState.loc}`;
    if (domCache._lastLoc !== newLoc) {
        domCache.locText.textContent = newLoc;
        domCache._lastLoc = newLoc;
    }

    const newTokens = gameState.tokens + 'T';
    if (domCache._lastTokens !== newTokens) {
        domCache.tokens.textContent = newTokens;
        domCache._lastTokens = newTokens;
    }

    Object.keys(gameState.stats).forEach(key => {
        const stat = gameState.stats[key];
        const config = statConfig[key];
        const blocks = domCache[`blocks-${key}`];

        const newValText = `${Math.round(stat.val)}%`;
        if (domCache[`_lastVal-${key}`] !== newValText) {
            domCache[`val-${key}`].textContent = newValText;
            domCache[`_lastVal-${key}`] = newValText;
        }

        if (key === 'pleasure') {
            const newDisplay = stat.val > 0 ? 'flex' : 'none';
            if (domCache._lastPleasureDisplay !== newDisplay) {
                domCache.pleasureStat.style.display = newDisplay;
                domCache._lastPleasureDisplay = newDisplay;
            }
        }

        const filledBlocks = Math.ceil(stat.val / 10);
        let isDanger = (stat.type === 'negative' && stat.val >= 70) || (stat.type === 'positive' && stat.val <= 30);
        if(key === 'stress' && stat.val >= 80) isDanger = true;
        if(key === 'libido' && stat.val >= 80) isDanger = true;

        const blocksHash = `${filledBlocks}-${isDanger}`;
        if (domCache[`_lastBlocksHash-${key}`] === blocksHash) return;
        domCache[`_lastBlocksHash-${key}`] = blocksHash;

        for (let i = 0; i < 10; i++) {
            const block = blocks[i];
            block.className = 'knd-block'; block.style.backgroundColor = ''; block.style.color = '';
            if (i < filledBlocks) {
                block.className += ' filled';
                if (key === 'pleasure' && filledBlocks >= 9) block.className += ' climax';
                else if (isDanger) { block.className += ' danger'; block.style.backgroundColor = config.danger; block.style.color = config.danger; }
                else { block.style.backgroundColor = config.color; }
            }
        }
    });
};

domWrites = 0;
renderStateOptimized();
console.log('First render writes:', domWrites);

domWrites = 0;
renderStateOptimized();
console.log('Second render writes (should be 0):', domWrites);

gameState.stats.energy.val = 55;
domWrites = 0;
renderStateOptimized();
console.log('Third render writes (val update only):', domWrites);

gameState.stats.energy.val = 65;
domWrites = 0;
renderStateOptimized();
console.log('Fourth render writes (blocks update):', domWrites);
