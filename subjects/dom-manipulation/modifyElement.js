/**
 * This function should modify an existing element's text content.
 *
 */
function modifyElement(id, newText) {
    document.getElementById(id).textContent = newText;
}

module.exports = modifyElement;
