const removeElement = require('../../subjects/dom-manipulation/removeElement');

test('modifyElement - modifies an existing element\'s text content', () => {
    document.body.innerHTML = '<div id="test-container"></div>';
    const element = document.getElementById('test-container');
    removeElement(document, 'test-container');
    expect(document.getElementById('test-container')).toBe(null);
});
