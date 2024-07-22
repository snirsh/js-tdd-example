const modifyElement = require('../../subjects/dom-manipulation/modifyElement');

test('modifyElement - modifies an existing element\'s text content', () => {
    document.body.innerHTML = '<div id="test-container"></div>';
    const element = document.getElementById('test-container');
    modifyElement('test-container', 'Test paragraph');

    expect(element.innerText).toBe('Test paragraph');
});
