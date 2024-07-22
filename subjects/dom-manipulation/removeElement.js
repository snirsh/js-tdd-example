/**
 * This function should modify an existing element's text content.
 *
 */
function removeElement(document, id) {
    document.getElementById(id).remove();
}

module.exports = removeElement;
