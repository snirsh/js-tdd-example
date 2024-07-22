/**
 * This function receives a tag, text, and parent element as parameters.
 * You should implement the function so that it creates a new element with the given tag and text,
 * @param tag
 * @param text
 * @param parent
 */
function createElement(tag, text, parent) {
    const element = document.createElement(tag);
    element.textContent = text;
    parent.appendChild(element);
    return element;
}

module.exports = createElement;
