/**
 * This function receives an element and a callback function as parameters.
 * You should implement the function so that when the element is clicked, the callback function is called.
 * @param element
 * @param callback
 */
function addClickListener(element, callback) {
    element.addEventListener('click', callback);
}

module.exports = addClickListener;
