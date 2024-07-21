const createElement = require('../../dom-manipulation/createElement');

describe('createElement', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="test-container"></div>';
    });

    test('creates and appends an element with the given tag and text', () => {
        const container = document.getElementById('test-container');
        const element = createElement('p', 'Test paragraph', container);

        expect(element.tagName).toBe('P');
        expect(element.textContent).toBe('Test paragraph');
        expect(container.children.length).toBe(1);
        expect(container.firstChild).toBe(element);
    });
});
