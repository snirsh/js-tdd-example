/**
 * This function should modify an existing element's text content.
 *
 */
function modifyElement(id, newText) {
    document.getElementById(id).innerText = newText;
}

module.exports = modifyElement;
