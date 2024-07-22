/**
 * This function should modify an existing element's text content.
 *
 */
function modifyElement(document, id, newText) {
    document.getElementById(id).innerText = newText;
}

module.exports = modifyElement;
