const assert = require('node:assert');

// We are going to test if the try/finally will work as expected in the same async fashion
async function testAsyncAction() {
    let buttonState = { disabled: false, textContent: 'SEND TO MEMORY' };
    const originalText = buttonState.textContent;

    buttonState.disabled = true;
    buttonState.textContent = 'SENDING...';

    try {
        await new Promise(resolve => setTimeout(resolve, 50)); // Simulating async delay
        // simulated success
    } finally {
        buttonState.disabled = false;
        buttonState.textContent = originalText;
    }

    assert.strictEqual(buttonState.disabled, false);
    assert.strictEqual(buttonState.textContent, 'SEND TO MEMORY');
}
testAsyncAction().then(() => console.log('Test passed')).catch(err => console.error(err));
