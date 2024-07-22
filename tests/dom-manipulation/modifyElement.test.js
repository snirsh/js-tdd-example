const modifyElement = require('../../subjects/dom-manipulation/modifyElement');

test('modifyElement - modifies an existing element\'s text content', () => {
    document.body.innerHTML = '<div id="test-container"></div>';

    const element = modifyElement('test-container', 'Test paragraph');

    expect(element.textContent).toBe('Test paragraph');

    modifyElement(element, 'New paragraph');
    expect(element.textContent).toBe('New paragraph');
});
