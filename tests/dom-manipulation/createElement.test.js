const createElement = require('../../subjects/dom-manipulation/createElement');

test('createElement - adds a paragraph to the container', () => {
    document.body.innerHTML = '<div id="test-container"></div>';
    const container = document.getElementById('test-container');
    const element = createElement('p', 'Test paragraph', container);

    expect(element.tagName).toBe('P');
    expect(element.textContent).toBe('Test paragraph');

    expect(container.innerHTML).toBe('<p>Test paragraph</p>');
});
