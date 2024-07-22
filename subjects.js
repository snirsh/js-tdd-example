module.exports = {
    'dom-manipulation': {
        name: 'DOM Manipulation',
        tests: {
            createElement: {
                name: 'Create Element',
                description: 'Create a new element and add it to the DOM',
                hint: 'Use document.createElement() to create the element and appendChild() to add it to the DOM'
            },
            modifyElement: {
                name: 'Modify Element',
                description: 'Modify an existing element in the DOM',
                hint: 'Use methods like setAttribute(), classList.add(), or textContent to modify the element'
            },
            removeElement: {
                name: 'Remove Element',
                description: 'Remove an element from the DOM',
                hint: 'Use removeChild() or remove() to delete the element from its parent'
            }
        }
    },
    events: {
        name: 'Events',
        tests: {
            addClickListener: {
                name: 'Add Click Listener',
                description: 'Attach a click event listener to an element',
                hint: 'Use the addEventListener() method with the "click" event type'
            },
            addEventListener: {
                name: 'Add Event Listener',
                description: 'Attach an event listener to an element',
                hint: 'Use the addEventListener() method to attach the event listener'
            },
            removeEventListener: {
                name: 'Remove Event Listener',
                description: 'Remove an event listener from an element',
                hint: 'Use the removeEventListener() method with the same function reference used in addEventListener()'
            },
            eventDelegation: {
                name: 'Event Delegation',
                description: 'Implement event delegation for dynamically added elements',
                hint: 'Attach the event listener to a parent element and use event.target to determine which child was clicked'
            }
        }
    }
};
