const addClickListener = require('../../subjects/events/addClickListener');

describe('addClickListener', () => {
    test('adds a click event listener to the element', () => {
        const element = document.createElement('button');
        const mockCallback = jest.fn();

        addClickListener(element, mockCallback);
        element.click();

        expect(mockCallback).toHaveBeenCalledTimes(1);
    });
});
